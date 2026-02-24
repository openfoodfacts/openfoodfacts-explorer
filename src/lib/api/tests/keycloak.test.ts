import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KeycloakApi } from '../keycloak';

describe('KeycloakApi', () => {
	const mockFetch = vi.fn() as ReturnType<typeof vi.fn> & typeof fetch;
	const config = {
		keycloakUrl: 'https://auth.example.com',
		clientId: 'my-client',
		redirectUri: 'https://app.example.com/callback'
	};
	let keycloak: KeycloakApi;

	beforeEach(() => {
		vi.resetAllMocks();
		keycloak = new KeycloakApi(mockFetch, config);
	});

	describe('exchangeCode', () => {
		it('should call fetch with correct parameters and return tokens on success', async () => {
			const mockTokens = {
				access_token: 'ac1',
				refresh_token: 'rf1',
				expires_in: 300,
				refresh_expires_in: 600,
				token_type: 'Bearer'
			};
			mockFetch.mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTokens)
			});

			const result = await keycloak.exchangeCode({ verifier: 'v', code: 'c' });

			expect(mockFetch).toHaveBeenCalledWith(
				'https://auth.example.com/protocol/openid-connect/token',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: expect.any(URLSearchParams)
				})
			);

			const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
			expect(body.get('grant_type')).toBe('authorization_code');
			expect(body.get('code')).toBe('c');
			expect(body.get('code_verifier')).toBe('v');
			expect(body.get('redirect_uri')).toBe(config.redirectUri);
			expect(body.get('client_id')).toBe(config.clientId);

			expect(result).toEqual(mockTokens);
		});

		it('should throw an error if the request fails', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				statusText: 'Bad Request',
				json: vi.fn().mockResolvedValue({ error_description: 'err' })
			});

			await expect(keycloak.exchangeCode({ verifier: 'v', code: 'c' })).rejects.toThrow(
				'Token request failed: err'
			);
		});
	});

	describe('refreshTokens', () => {
		it('should call fetch and return refreshed tokens', async () => {
			const mockTokens = {
				access_token: 'ac1',
				refresh_token: 'rf1',
				expires_in: 300,
				refresh_expires_in: 600,
				token_type: 'Bearer'
			};
			mockFetch.mockResolvedValue({
				ok: true,
				json: vi.fn().mockResolvedValue(mockTokens)
			});

			const result = await keycloak.refreshTokens('old');

			expect(mockFetch).toHaveBeenCalledWith(
				'https://auth.example.com/protocol/openid-connect/token',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body: expect.any(URLSearchParams)
				})
			);

			const body = mockFetch.mock.calls[0][1].body as URLSearchParams;
			expect(body.get('grant_type')).toBe('refresh_token');
			expect(body.get('refresh_token')).toBe('old');
			expect(body.get('redirect_uri')).toBe(config.redirectUri);
			expect(body.get('client_id')).toBe(config.clientId);

			expect(result).toEqual(mockTokens);
		});
	});

	describe('loginUrl', () => {
		it('should generate a correct login URL', () => {
			const urlStr = keycloak.loginUrl({
				state: 's',
				codeChallenge: 'ch',
				codeChallengeMethod: 'S256'
			});
			const url = new URL(urlStr);

			expect(url.origin + url.pathname).toBe(
				'https://auth.example.com/protocol/openid-connect/auth'
			);
			expect(url.searchParams.get('client_id')).toBe(config.clientId);
			expect(url.searchParams.get('redirect_uri')).toBe(config.redirectUri);
			expect(url.searchParams.get('response_type')).toBe('code');
			expect(url.searchParams.get('state')).toBe('s');
			expect(url.searchParams.get('code_challenge')).toBe('ch');
			expect(url.searchParams.get('code_challenge_method')).toBe('S256');
			expect(url.searchParams.get('scope')).toBe('openid');
		});

		it('should include lang and scope when provided', () => {
			const urlStr = keycloak.loginUrl({
				state: 's',
				codeChallenge: 'ch',
				codeChallengeMethod: 'S256',
				lang: 'fr',
				scope: 'openid email'
			});
			const url = new URL(urlStr);

			expect(url.searchParams.get('ui_locales')).toBe('fr');
			expect(url.searchParams.get('scope')).toBe('openid email');
		});
	});

	describe('logoutUrl', () => {
		it('should generate a correct logout URL', () => {
			const urlStr = keycloak.logoutUrl({
				refreshToken: 'rf1',
				postLogoutRedirectUri: 'https://app.example.com'
			});
			const url = new URL(urlStr);

			expect(url.origin + url.pathname).toBe(
				'https://auth.example.com/protocol/openid-connect/logout'
			);
			expect(url.searchParams.get('client_id')).toBe(config.clientId);
			expect(url.searchParams.get('refresh_token')).toBe('rf1');
			expect(url.searchParams.get('post_logout_redirect_uri')).toBe('https://app.example.com');
		});
	});
});
