import { OAUTH_CLIENT_ID, KEYCLOAK_URL } from '$lib/const';
import { persisted } from 'svelte-local-storage-store';
import { get } from 'svelte/store';

export type AuthTokens = {
	access_token: string;
	refresh_token: string;
	id_token: string;
};

export const userAuthTokens = persisted<AuthTokens | null>('userAuthTokens', null);

/**
 * Complete the PKCE token exchange process by exchanging the authorization code
 * for access and refresh tokens.
 * @param verifier - the code verifier created during the initial login request.
 * @param code - the authorization code received from the Keycloak callback URL.
 * @returns the JWT tokens containing access, refresh, and ID tokens.
 */
export async function pkceTokenExchange(verifier: string, code: string) {
	if (!code) {
		throw new Error('Authorization code missing from callback URL');
	}

	if (!verifier) {
		throw new Error('Code verifier missing from local storage');
	}

	const body = new URLSearchParams({
		code: code,
		grant_type: 'authorization_code',
		client_id: OAUTH_CLIENT_ID,
		code_verifier: verifier
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
export async function refreshAccessToken() {
	const refreshToken = get(userAuthTokens)?.refresh_token;

	if (!refreshToken) {
		throw new Error('No refresh token available');
	}

	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		client_id: OAUTH_CLIENT_ID
	});

	const response = await fetch(`${KEYCLOAK_URL}/protocol/openid-connect/token`, {
		method: 'POST',
		body: body
	});

	const jwt = await response.json();
	return jwt;
}

/**
 * Saves the JWT tokens to the local storage store.
 * @param jwt - the JWT tokens containing access, refresh, and ID tokens.
 */
export function saveAuthTokens(tokens: AuthTokens) {
	userAuthTokens.set(tokens);
}
