import { OAUTH_CLIENT_ID, KEYCLOAK_URL, OAUTH_REDIRECT_URI } from '$lib/const';
import { persisted } from 'svelte-local-storage-store';
import { derived, get } from 'svelte/store';

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

export function getAuthTokens() {
	return get(userAuthTokens);
}

export function clearAuthTokens() {
	userAuthTokens.set(null);
}

function parseJWT<T extends Record<string, unknown>>(token: string): T {
	const payload = token.split('.')[1];
	const decoded = atob(payload);
	return JSON.parse(decoded) as T;
}

export type UserInfo = {
	preferred_username: string;
	email: string;
};

/**
 * Parses the ID token to extract user information.
 * @param idToken - the ID token from the JWT.
 * @returns the parsed user information.
 */
function parseIdToken(idToken: string) {
	if (!idToken) {
		throw new Error('ID token is required for parsing');
	}

	try {
		return parseJWT<UserInfo>(idToken);
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
