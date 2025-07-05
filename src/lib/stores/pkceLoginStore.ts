import { AUTH_PKCE_ID, KEYCLOAK_URL, LOGIN_CALLBACK_URL } from '$lib/const';
import { persisted } from 'svelte-local-storage-store';
import { get } from 'svelte/store';

export type AuthTokens = {
	accessToken: string;
	refreshToken: string;
	idToken: string;
};

export const userAuthTokens = persisted<AuthTokens>('userAuthTokens', {
	accessToken: '',
	refreshToken: '',
	idToken: ''
});

export async function getAccessToken() {
	const verifier = localStorage.getItem('verifier');
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');

	if (!code) {
		throw new Error('Authorization code missing from callback URL');
	}

	if (!verifier) {
		throw new Error('Code verifier missing from local storage');
	}

	const body = new URLSearchParams({
		code: code,
		grant_type: 'authorization_code',
		redirect_uri: LOGIN_CALLBACK_URL,
		client_id: AUTH_PKCE_ID,
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

export async function refreshAccessToken() {
	const refreshToken = get(userAuthTokens).refreshToken;

	if (!refreshToken) {
		throw new Error('No refresh token available');
	}

	const body = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken,
		client_id: AUTH_PKCE_ID,
		redirect_uri: LOGIN_CALLBACK_URL
	});

	const response = await fetch(`${KEYCLOAK_URL}/protocol/openid-connect/token`, {
		method: 'POST',
		body: body
	});

	const jwt = await response.json();
	return jwt;
}

export function saveAuthTokens(jwt: {
	access_token: string;
	refresh_token: string;
	id_token: string;
}) {
	userAuthTokens.set({
		accessToken: jwt.access_token,
		refreshToken: jwt.refresh_token,
		idToken: jwt.id_token
	});
}
