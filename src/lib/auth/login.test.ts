import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const exchangeCodeMock = vi.fn();
const loginUrlMock = vi.fn();

vi.mock('#lib/api.js', () => ({
	createKeycloakApi: vi.fn(() => ({
		exchangeCode: exchangeCodeMock,
		loginUrl: loginUrlMock
	}))
}));
vi.mock('#lib/analytics.js', () => ({ trackOffEvent: vi.fn() }));
vi.mock('#lib/stores/auth.js', async () => {
	const actual = await vi.importActual<typeof import('#lib/stores/auth.js')>('#lib/stores/auth.js');
	return {
		...actual,
		getAuthTokens: vi.fn(),
		saveAuthTokens: vi.fn(),
		isTokenExpired: vi.fn()
	};
});

import { trackOffEvent } from '#lib/analytics.js';
import type { KeycloakTokens } from '#lib/api/keycloak.js';
import { getAuthTokens, isTokenExpired, saveAuthTokens } from '#lib/stores/auth.js';
import { completeLoginCallback, hasValidAuthSession, prepareLoginRedirect } from './login';

function makeFakeJwt(payload: Record<string, unknown>): string {
	const encode = (obj: Record<string, unknown>) =>
		Buffer.from(JSON.stringify(obj)).toString('base64url');
	return `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode(payload)}.sig`;
}

function makeValidTokens(): KeycloakTokens {
	return {
		access_token: makeFakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 }),
		refresh_token: 'refresh-token',
		id_token: makeFakeJwt({ preferred_username: 'teolemon', email: 'teo@example.org' }),
		expires_in: 3600,
		refresh_expires_in: 7200,
		token_type: 'Bearer'
	};
}

const storedValues = new Map<string, string>();
const localStorageMock = {
	getItem: (key: string) => storedValues.get(key) ?? null,
	setItem: (key: string, value: string) => storedValues.set(key, value),
	removeItem: (key: string) => storedValues.delete(key)
};

describe('auth login helpers', () => {
	beforeEach(() => {
		storedValues.clear();
		vi.clearAllMocks();
		vi.stubGlobal('localStorage', localStorageMock);
		vi.mocked(getAuthTokens).mockReturnValue(null);
		vi.mocked(isTokenExpired).mockReturnValue(false);
		loginUrlMock.mockReturnValue('https://auth.openfoodfacts.net/login?state=test');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('hasValidAuthSession', () => {
		it('returns false when tokens are missing or id_token is absent', () => {
			expect(hasValidAuthSession(null)).toBe(false);
			const noIdToken = { ...makeValidTokens(), id_token: undefined };
			expect(hasValidAuthSession(noIdToken)).toBe(false);
		});

		it('returns false when access token is expired', () => {
			vi.mocked(isTokenExpired).mockReturnValue(true);
			expect(hasValidAuthSession(makeValidTokens())).toBe(false);
		});

		it('returns false when id_token is malformed', () => {
			const badIdToken = { ...makeValidTokens(), id_token: 'not-a-jwt' };
			expect(hasValidAuthSession(badIdToken)).toBe(false);
		});

		it('returns true for valid non-expired tokens', () => {
			expect(hasValidAuthSession(makeValidTokens())).toBe(true);
		});
	});

	describe('prepareLoginRedirect', () => {
		it('stores PKCE state and returns Keycloak loginUrl when logged out', async () => {
			const url = new URL(
				'http://localhost:5173/world-en/oauth/login?redirect=%2Fworld-en%2Fdashboard'
			);

			const result = await prepareLoginRedirect(url);

			expect(result).toEqual({
				alreadyAuthenticated: false,
				loginUrl: 'https://auth.openfoodfacts.net/login?state=test'
			});
			expect(localStorageMock.getItem('verifier')).toBeTruthy();
			expect(localStorageMock.getItem('authState')).toBeTruthy();
			expect(localStorageMock.getItem('authRedirect')).toBe('/world-en/dashboard');
		});

		it('returns safe targetPath without starting a new PKCE flow when already logged in', async () => {
			vi.mocked(getAuthTokens).mockReturnValue(makeValidTokens());
			const url = new URL(
				'http://localhost:5173/world-en/oauth/login?redirect=%2Fworld-en%2Fdashboard'
			);

			const result = await prepareLoginRedirect(url);

			expect(result).toEqual({
				alreadyAuthenticated: true,
				targetPath: '/world-en/dashboard'
			});
			expect(localStorageMock.getItem('authState')).toBeNull();
			expect(loginUrlMock).not.toHaveBeenCalled();
		});

		it('sanitizes external redirect targets when already logged in', async () => {
			vi.mocked(getAuthTokens).mockReturnValue(makeValidTokens());
			const url = new URL('http://localhost:5173/oauth/login?redirect=https%3A%2F%2Fevil.example');

			const result = await prepareLoginRedirect(url);

			expect(result).toEqual({
				alreadyAuthenticated: true,
				targetPath: '/'
			});
		});
	});

	describe('completeLoginCallback', () => {
		it('exchanges the code and saves tokens on matching state', async () => {
			const newTokens = makeValidTokens();
			exchangeCodeMock.mockResolvedValue(newTokens);
			localStorageMock.setItem('authState', 'expected-state');
			localStorageMock.setItem('verifier', 'pkce-verifier');
			localStorageMock.setItem('authRedirect', '/world-en/dashboard');

			const url = new URL(
				'http://localhost:5173/oauth/login/callback?state=expected-state&code=auth-code'
			);
			const result = await completeLoginCallback(url, fetch);

			expect(result).toEqual({
				targetPath: '/world-en/dashboard',
				reusedSession: false
			});
			expect(exchangeCodeMock).toHaveBeenCalledWith({
				code: 'auth-code',
				verifier: 'pkce-verifier'
			});
			expect(saveAuthTokens).toHaveBeenCalledWith(newTokens);
			expect(trackOffEvent).toHaveBeenCalledWith('account', 'login_succeeded');
			expect(localStorageMock.getItem('authState')).toBeNull();
			expect(localStorageMock.getItem('verifier')).toBeNull();
			expect(localStorageMock.getItem('authRedirect')).toBeNull();
		});

		it('redirects safely without exchanging code on stale callback when already authenticated', async () => {
			vi.mocked(getAuthTokens).mockReturnValue(makeValidTokens());
			const url = new URL(
				'http://localhost:5173/oauth/login/callback?state=stale-state&code=replayed-code'
			);

			const result = await completeLoginCallback(url, fetch);

			expect(result).toEqual({
				targetPath: '/',
				reusedSession: true
			});
			expect(exchangeCodeMock).not.toHaveBeenCalled();
			expect(saveAuthTokens).not.toHaveBeenCalled();
			expect(trackOffEvent).not.toHaveBeenCalled();
		});

		it('rejects mismatched state when an active login flow is in progress even if tokens exist', async () => {
			vi.mocked(getAuthTokens).mockReturnValue(makeValidTokens());
			localStorageMock.setItem('authState', 'active-state');
			const url = new URL(
				'http://localhost:5173/oauth/login/callback?state=wrong-state&code=auth-code'
			);

			await expect(completeLoginCallback(url, fetch)).rejects.toThrow(
				'Authentication failed: Invalid state parameter'
			);
			expect(exchangeCodeMock).not.toHaveBeenCalled();
		});

		it('rejects missing or invalid state when user is logged out', async () => {
			const url = new URL(
				'http://localhost:5173/oauth/login/callback?state=stale-state&code=auth-code'
			);

			await expect(completeLoginCallback(url, fetch)).rejects.toThrow(
				'Authentication failed: Invalid state parameter'
			);
			expect(exchangeCodeMock).not.toHaveBeenCalled();
		});
	});
});
