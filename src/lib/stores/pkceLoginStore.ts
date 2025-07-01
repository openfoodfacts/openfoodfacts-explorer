import { AUTH_PKCE_ID, KEYCLOAK_URL, LOGIN_CALLBACK_URL } from '$lib/const';
import { persisted } from 'svelte-local-storage-store';

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
		let refreshToken = '';
		userAuthTokens.subscribe((tokens) => {
			refreshToken = tokens.refreshToken;
		})();

		if (!refreshToken) {
			throw new Error('No refresh token available');
		}

		body.set('grant_type', 'refresh_token');
		body.set('refresh_token', refreshToken);
	}

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
		refreshToken: jwt.refresh_token || '',
		idToken: jwt.id_token
	});
}
