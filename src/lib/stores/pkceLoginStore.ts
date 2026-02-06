import { OAUTH_CLIENT_ID, KEYCLOAK_URL, OAUTH_REDIRECT_URI } from '$lib/const';
import { persisted } from 'svelte-local-storage-store';
import { derived, get } from 'svelte/store';
import { decodeJwt } from 'jose';

export type AuthTokens = {
	access_token: string;
	refresh_token: string;
	id_token: string;
};

// Module-level variable to track ongoing refresh operations
// This prevents multiple concurrent refresh attempts (race conditions)
let refreshPromise: Promise<AuthTokens> | null = null;

export const userAuthTokens = persisted<AuthTokens | null>('userAuthTokens', null);

/**
 * Complete the PKCE token exchange process by exchanging the authorization code
 * for access and refresh tokens.
 * @param verifier - the code verifier created during the initial login request.
 * @param code - the authorization code received from the Keycloak callback URL.
 * @returns the JWT tokens containing access, refresh, and ID tokens.
 */
export async function pkceTokenExchange(verifier: string, code: string, url: URL) {
	if (!code) {
		throw new Error('Authorization code missing from callback URL');
	}

	if (!verifier) {
		throw new Error('Code verifier missing from local storage');
	}

	const redirectUri = OAUTH_REDIRECT_URI(url);

	const body = new URLSearchParams({
		code: code,
		grant_type: 'authorization_code',
		client_id: OAUTH_CLIENT_ID,
		code_verifier: verifier,
		redirect_uri: redirectUri
	});

	const response = await fetch(`${KEYCLOAK_URL}/protocol/openid-connect/token`, {
		method: 'POST',
		body: body
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(
			`Token exchange failed: ${errorData?.error_description || response.statusText}`
		);
	}

	const jwt = await response.json();
	localStorage.removeItem('verifier');
	return jwt;
}

/**
 * Refreshes the access token using the stored refresh token.
 * @returns the new JWT tokens containing access, refresh, and ID tokens.
 */
export async function refreshAccessToken(url: URL) {
	const refreshToken = get(userAuthTokens)?.refresh_token;

	if (!refreshToken) {
		throw new Error('No refresh token available');
	}

	const redirectUri = OAUTH_REDIRECT_URI(url);

	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		client_id: OAUTH_CLIENT_ID,
		redirect_uri: redirectUri
	});

	const response = await fetch(`${KEYCLOAK_URL}/protocol/openid-connect/token`, {
		method: 'POST',
		body: body
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);
		throw new Error(`Token refresh failed: ${errorData?.error_description || response.statusText}`);
	}

	const jwt = await response.json();
	return jwt;
}

/**
 * Ensures valid authentication tokens are available, refreshing them if necessary.
 * This function implements token refresh deduplication - if multiple calls happen
 * simultaneously, they will all wait for the same refresh operation to complete.
 * @param url - the current URL (needed for redirect_uri)
 * @returns valid authentication tokens
 */
export async function ensureValidToken(url: URL): Promise<AuthTokens> {
	const tokens = get(userAuthTokens);

	if (!tokens) {
		throw new Error('No authentication tokens available');
	}

	// If token is still valid, return it immediately
	if (!isTokenExpired(tokens)) {
		return tokens;
	}

	// If a refresh is already in progress, wait for it
	if (refreshPromise) {
		return refreshPromise;
	}

	// Start a new refresh operation
	refreshPromise = refreshAccessToken(url)
		.then((newTokens) => {
			saveAuthTokens(newTokens);
			return newTokens;
		})
		.finally(() => {
			// Clear the promise once the refresh is complete (success or failure)
			refreshPromise = null;
		});

	return refreshPromise;
}

/**
 * Saves the JWT tokens to the local storage store.
 * @param jwt - the JWT tokens containing access, refresh, and ID tokens.
 */
export function saveAuthTokens(tokens: AuthTokens) {
	userAuthTokens.set(tokens);
}

export function getAuthTokens() {
	return get(userAuthTokens);
}

export function clearAuthTokens() {
	userAuthTokens.set(null);
}

const CLOCK_SKEW_SECONDS = 30;

/**
 * Checks if the access token is expired or will expire soon.
 * @param tokens - the authentication tokens
 * @param bufferSeconds - number of seconds before expiration to consider token expired (default: 60)
 * @returns true if the token is expired or will expire within the buffer period
 */
export function isTokenExpired(tokens: AuthTokens, bufferSeconds = 60): boolean {
	try {
		const payload = decodeJwt(tokens.access_token);

		// If exp is missing, treat token as invalid
		if (!payload.exp) {
			return true;
		}

		const nowInSeconds = Math.floor(Date.now() / 1000);
		return nowInSeconds >= payload.exp - bufferSeconds - CLOCK_SKEW_SECONDS;
	} catch (error) {
		console.error('Failed to parse token expiration:', error);
		return true;
	}
}

export type UserInfo = {
	preferred_username: string;
	email: string;
	roles?: string[];
};

type KeycloakToken = {
	preferred_username: string;
	email: string;
	realm_access?: {
		roles: string[];
	};
	resource_access?: Record<string, { roles: string[] }>;
};

/**
 * Parses the ID token to extract user information.
 * @param idToken - the ID token from the JWT.
 * @returns the parsed user information.
 */
function parseIdToken(idToken: string): UserInfo {
	if (!idToken) {
		throw new Error('ID token is required for parsing');
	}

	try {
		const token = decodeJwt<KeycloakToken>(idToken);
		return {
			preferred_username: token.preferred_username,
			email: token.email,
			roles: token.realm_access?.roles || []
		};
	} catch (error) {
		throw new Error(`Failed to parse ID token: ${error}`);
	}
}

export const userInfo = derived(userAuthTokens, ($tokens) => {
	if (!$tokens) {
		return null;
	}

	try {
		return parseIdToken($tokens.id_token);
	} catch (error) {
		console.error('Failed to parse user info:', error);
		return null;
	}
});

export function wrapFetchWithAuth(fetch: typeof window.fetch): typeof window.fetch {
	return async (input, init) => {
		const tokens = get(userAuthTokens);
		if (!tokens) {
			return fetch(input, init);
		}

		// Proactively ensure token is valid before making the request
		// This prevents unnecessary 401 errors and reduces failed requests
		try {
			const url = new URL(window.location.href);
			const validTokens = await ensureValidToken(url);

			const headers = new Headers(input instanceof Request ? input.headers : undefined);
			if (init?.headers) {
				const initHeaders = new Headers(init.headers);
				initHeaders.forEach((value, key) => headers.set(key, value));
			}
			headers.set('Authorization', 'Bearer ' + validTokens.access_token);

			const response = await fetch(input, { ...init, headers });

			// If still getting 401 (e.g., token was revoked), try one more refresh
			if (response.status === 401) {
				try {
					// Force a new refresh by clearing the current tokens first
					const newTokens = await refreshAccessToken(url);
					saveAuthTokens(newTokens);

					headers.set('Authorization', 'Bearer ' + newTokens.access_token);
					return fetch(input, { ...init, headers });
				} catch (refreshError) {
					console.error('Failed to refresh access token:', refreshError);
					clearAuthTokens();
					throw new Error('Authentication failed. Please log in again.');
				}
			}

			return response;
		} catch (error) {
			// If token validation/refresh fails, clear tokens and propagate error
			if (error instanceof Error && error.message.includes('No authentication tokens')) {
				clearAuthTokens();
			}
			throw error;
		}
	};
}
