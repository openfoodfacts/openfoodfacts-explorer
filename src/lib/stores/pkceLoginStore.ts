import { AUTH_PKCE_ID, KEYCLOAK_URL, LOGIN_CALLBACK_URL } from '$lib/const';
import { persisted } from 'svelte-local-storage-store';

export type AuthTokens = {
	expires_in: number;
	access_token: string;
	refresh_token: string;
	id_token: string;
};

export const userAccessToken = persisted('userAccessToken', '');
export const userRefreshToken = persisted('userRefreshToken', '');
export const userIdToken = persisted('userIdToken', '');

export async function getAccessToken(useRefreshToken: boolean = false) {
	const verifier = localStorage.getItem('verifier');
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');

	const body = new URLSearchParams({
		code: code ?? '',
		grant_type: 'authorization_code',
		redirect_uri: LOGIN_CALLBACK_URL,
		client_id: AUTH_PKCE_ID,
		code_verifier: verifier ?? ''
	});

	if (useRefreshToken) {
		const refreshToken = document.cookie
			.split('; ')
			.find((row) => row.startsWith('userRefreshToken='))
			?.split('=')[1];

		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		body.set('grant_type', 'refresh_token');
		body.set('refresh_token', refreshToken);
	}

	const response = await fetch(`${KEYCLOAK_URL}/protocol/openid-connect/token`, {
		method: 'POST',
		body: body,
		headers: new Headers()
	});

	const jwt = await response.json();
	return jwt;
}

export function saveAuthTokens(jwt: AuthTokens) {
	// Save tokens in local storage
	userAccessToken.set(jwt.access_token);
	userRefreshToken.set(jwt.refresh_token || '');
	userIdToken.set(jwt.id_token);
}
