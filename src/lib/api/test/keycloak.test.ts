import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KeycloakApi } from '../keycloak';

describe('KeycloakApi', () => {
	const mockConfig = {
		keycloakUrl: 'https://auth.example.com',
		clientId: 'test-client',
		redirectUri: 'https://app.example.com/callback'
	};

	let mockFetch: ReturnType<typeof vi.fn> & typeof fetch;
	let api: KeycloakApi;

	beforeEach(() => {
		mockFetch = vi.fn() as ReturnType<typeof vi.fn> & typeof fetch;
		api = new KeycloakApi(mockFetch, mockConfig);
	});

	describe('exchangeCode', () => {
		it('should call token endpoint with correct parameters', async () => {
			const mockTokens = {
				access_token: 'access-123',
				refresh_token: 'refresh-456',
				expires_in: 3600,
				refresh_expires_in: 7200,
				token_type: 'Bearer'
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTokens
			});

			const result = await api.exchangeCode({
				verifier: 'test-verifier',
				code: 'auth-code-123'
			});

			expect(result).toEqual(mockTokens);

			expect(mockFetch).toHaveBeenCalledTimes(1);
			expect(mockFetch).toHaveBeenCalledWith(
				'https://auth.example.com/protocol/openid-connect/token',
				expect.objectContaining({
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				})
			);

			const callArgs = mockFetch.mock.calls[0];
			const body: URLSearchParams = callArgs[1].body;

			expect(body.get('grant_type')).toBe('authorization_code');
			expect(body.get('code')).toBe('auth-code-123');
			expect(body.get('code_verifier')).toBe('test-verifier');
			expect(body.get('redirect_uri')).toBe('https://app.example.com/callback');
			expect(body.get('client_id')).toBe('test-client');
		});

		it('should throw an error if the request fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				statusText: 'Bad Request',
				json: async () => ({ error_description: 'Invalid code' })
			});

			await expect(api.exchangeCode({ verifier: 'v', code: 'c' })).rejects.toThrow(
				'Token request failed: Invalid code'
			);
		});

		it('should throw an error with statusText if json parsing fails', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				statusText: 'Internal Server Error',
				json: async () => {
					throw new Error('Unparseable');
				}
			});

			await expect(api.exchangeCode({ verifier: 'v', code: 'c' })).rejects.toThrow(
				'Token request failed: Internal Server Error'
			);
		});
	});

	describe('refreshTokens', () => {
		it('should call token endpoint with refresh token', async () => {
			const mockTokens = {
				access_token: 'new-access-123',
				refresh_token: 'new-refresh-456',
				expires_in: 3600,
				refresh_expires_in: 7200,
				token_type: 'Bearer'
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockTokens
			});

			const result = await api.refreshTokens('old-refresh');

			expect(result).toEqual(mockTokens);

			const callArgs = mockFetch.mock.calls[0];
			const body: URLSearchParams = callArgs[1].body;

			expect(body.get('grant_type')).toBe('refresh_token');
			expect(body.get('refresh_token')).toBe('old-refresh');
			expect(body.get('redirect_uri')).toBe('https://app.example.com/callback');
			expect(body.get('client_id')).toBe('test-client');
		});
	});

	describe('loginUrl', () => {
		it('should generate a correct login URL', () => {
			const urlStr = api.loginUrl({
				state: 'state-123',
				codeChallenge: 'challenge-abc',
				codeChallengeMethod: 'S256',
				lang: 'en'
			});

			const url = new URL(urlStr);

			expect(url.origin + url.pathname).toBe(
				'https://auth.example.com/protocol/openid-connect/auth'
			);
			expect(url.searchParams.get('client_id')).toBe('test-client');
			expect(url.searchParams.get('redirect_uri')).toBe('https://app.example.com/callback');
			expect(url.searchParams.get('response_type')).toBe('code');
			expect(url.searchParams.get('state')).toBe('state-123');
			expect(url.searchParams.get('code_challenge')).toBe('challenge-abc');
			expect(url.searchParams.get('code_challenge_method')).toBe('S256');
			expect(url.searchParams.get('scope')).toBe('openid');
			expect(url.searchParams.get('ui_locales')).toBe('en');
		});

		it('should default scope to openid if not provided', () => {
			const urlStr = api.loginUrl({
				state: 'state',
				codeChallenge: 'cc',
				codeChallengeMethod: 'S256'
			});
			const url = new URL(urlStr);
			expect(url.searchParams.get('scope')).toBe('openid');
			expect(url.searchParams.has('ui_locales')).toBe(false);
		});
	});

	describe('logoutUrl', () => {
		it('should generate a correct logout URL', () => {
			const urlStr = api.logoutUrl({
				refreshToken: 'refresh-123',
				postLogoutRedirectUri: 'https://app.example.com/home'
			});

			const url = new URL(urlStr);

			expect(url.origin + url.pathname).toBe(
				'https://auth.example.com/protocol/openid-connect/logout'
			);
			expect(url.searchParams.get('client_id')).toBe('test-client');
			expect(url.searchParams.get('refresh_token')).toBe('refresh-123');
			expect(url.searchParams.get('post_logout_redirect_uri')).toBe('https://app.example.com/home');
		});
	});
});
