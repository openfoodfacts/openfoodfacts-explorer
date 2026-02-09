import { persisted } from 'svelte-local-storage-store';
import { get } from 'svelte/store';
import { decodeJwt } from 'jose';
import { createKeycloakApi, type KeycloakTokens } from '$lib/api/keycloak';

// Module-level variable to track ongoing refresh operations
// This prevents multiple concurrent refresh attempts (race conditions)
let refreshPromise: Promise<KeycloakTokens> | null = null;

export const userAuthTokens = persisted<KeycloakTokens | null>('userAuthTokens', null);

/**
 * Refreshes the access token using the stored refresh token.
 * @returns the new JWT tokens containing access, refresh, and ID tokens.
 */
export async function renewAccessToken(url: URL) {
	const refreshToken = get(userAuthTokens)?.refresh_token;

	if (!refreshToken) {
		throw new Error('No refresh token available');
	}

	return await createKeycloakApi(fetch, url).refreshTokens(refreshToken);
}

/**
 * Initiates a token refresh with deduplication logic.
 * If a refresh is already in progress, returns the existing promise.
 * Otherwise, starts a new refresh operation.
 * @param url - the current URL (needed for redirect_uri)
 * @returns promise that resolves to new authentication tokens
 */
function initiateTokenRefresh(url: URL): Promise<KeycloakTokens> {
	// If a refresh is already in progress, wait for it
	if (refreshPromise) {
		return refreshPromise;
	}

	// Start a new refresh operation with deduplication
	refreshPromise = renewAccessToken(url)
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
 * Ensures valid authentication tokens are available, refreshing them if necessary.
 * This function implements token refresh deduplication - if multiple calls happen
 * simultaneously, they will all wait for the same refresh operation to complete.
 * @param url - the current URL (needed for redirect_uri)
 * @returns valid authentication tokens
 */
export async function ensureValidToken(url: URL): Promise<KeycloakTokens> {
	const tokens = get(userAuthTokens);

	if (!tokens) {
		throw new Error('No authentication tokens available');
	}

	// If token is still valid, return it immediately
	if (!isTokenExpired(tokens)) {
		return tokens;
	}

	// Initiate refresh with deduplication
	return initiateTokenRefresh(url);
}

/**
 * Saves the JWT tokens to the local storage store.
 * @param jwt - the JWT tokens containing access, refresh, and ID tokens.
 */
export function saveAuthTokens(tokens: KeycloakTokens) {
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
export function isTokenExpired(tokens: KeycloakTokens, bufferSeconds = 60): boolean {
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
				// Use the deduplication logic to prevent refresh storms
				// when multiple parallel requests all get 401 responses
				const newTokens = await initiateTokenRefresh(url);

				headers.set('Authorization', 'Bearer ' + newTokens.access_token);
				return fetch(input, { ...init, headers });
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
