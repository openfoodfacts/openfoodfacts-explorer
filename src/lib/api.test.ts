import { beforeEach, describe, expect, it, vi } from 'vitest';

const config = vi.hoisted(() => ({
	robotoffUrl: 'https://service-user:service-password@robotoff.example/api',
	keycloakUrl: 'https://auth.example',
	clientId: 'explorer-client'
}));
const mockRobotoff = vi.hoisted(() => vi.fn());
const mockWrapFetchWithCredentials = vi.hoisted(() => vi.fn());
const wrappedFetch = vi.hoisted(() => vi.fn());

vi.mock('@openfoodfacts/openfoodfacts-nodejs', () => ({
	Robotoff: mockRobotoff
}));

vi.mock('./api/utils', () => ({
	wrapFetchWithCredentials: mockWrapFetchWithCredentials
}));

vi.mock('$app/env/public', () => ({
	PUBLIC_OFF_BASE_URL: '',
	PUBLIC_ENVIRONMENT: '',
	PUBLIC_IMAGES_URL: 'https://images.example',
	PUBLIC_NUTRIPATROL_URL: 'https://nutripatrol.example',
	PUBLIC_PRICES_API_URL: '',
	get PUBLIC_ROBOTOFF_URL() {
		return config.robotoffUrl;
	},
	get PUBLIC_AUTH_BASE_URL() {
		return config.keycloakUrl;
	},
	get PUBLIC_AUTH_PKCE_ID() {
		return config.clientId;
	},
	PUBLIC_KEYCLOAK_REALM: 'openfoodfacts'
}));

const asFetch = (mock: unknown) => mock as typeof fetch;

describe('core API client factories', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		config.robotoffUrl = 'https://service-user:service-password@robotoff.example/api';
		config.keycloakUrl = 'https://auth.example';
		config.clientId = 'explorer-client';
		mockWrapFetchWithCredentials.mockImplementation((fetch: typeof window.fetch, url: URL) => {
			const cleanUrl = new URL(url);
			cleanUrl.username = '';
			cleanUrl.password = '';
			return { fetch: wrappedFetch as typeof fetch, url: cleanUrl };
		});
	});

	it('constructs the Robotoff client with a credential-free URL and wrapped fetch', async () => {
		const { createRobotoffApi } = await import('./api');
		const fetch = asFetch(vi.fn());

		createRobotoffApi(fetch);

		expect(mockWrapFetchWithCredentials).toHaveBeenCalledOnce();
		expect(mockWrapFetchWithCredentials.mock.calls[0]?.[0]).toBe(fetch);
		const suppliedUrl = mockWrapFetchWithCredentials.mock.calls[0]?.[1] as URL;
		expect(suppliedUrl.username).toBe('service-user');
		expect(suppliedUrl.password).toBe('service-password');
		expect(mockRobotoff).toHaveBeenCalledWith(wrappedFetch, {
			baseUrl: 'https://robotoff.example/api'
		});
	});

	it('rejects Keycloak client creation without the required configuration', async () => {
		config.clientId = '';
		const { createKeycloakApi } = await import('./api');

		expect(() =>
			createKeycloakApi(asFetch(vi.fn()), new URL('https://explorer.example/settings'))
		).toThrow('Missing Keycloak configuration');
	});

	it('builds Keycloak authorization URLs using an origin-only callback URL', async () => {
		const { createKeycloakApi } = await import('./api');
		const api = createKeycloakApi(
			asFetch(vi.fn()),
			new URL('https://explorer.example/products/123?source=editor')
		);

		const loginUrl = new URL(
			api.loginUrl({
				state: 'csrf-state',
				codeChallenge: 'challenge',
				codeChallengeMethod: 'S256',
				lang: 'fr'
			})
		);

		expect(loginUrl.origin).toBe('https://auth.example');
		expect(loginUrl.pathname).toBe('/realms/openfoodfacts/protocol/openid-connect/auth');
		expect(loginUrl.searchParams.get('client_id')).toBe('explorer-client');
		expect(loginUrl.searchParams.get('redirect_uri')).toBe(
			'https://explorer.example/oauth/login/callback'
		);
		expect(loginUrl.searchParams.get('response_type')).toBe('code');
		expect(loginUrl.searchParams.get('state')).toBe('csrf-state');
		expect(loginUrl.searchParams.get('code_challenge')).toBe('challenge');
		expect(loginUrl.searchParams.get('code_challenge_method')).toBe('S256');
		expect(loginUrl.searchParams.get('ui_locales')).toBe('fr');
	});
});
