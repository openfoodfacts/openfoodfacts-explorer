import { AUTH_BASE_URL, AUTH_PKCE_ID, OFF_EXP_BASE_URL } from '$lib/const';

export const keycloak = `${AUTH_BASE_URL}/realms/open-products-facts`;
export const pkceClientId = AUTH_PKCE_ID;
export const accountUrl = `${keycloak}/account/#/`;

export type AuthTokens = {
	expires_in: number;
	access_token: string;
	refresh_token: string;
	id_token: string;
};

export async function getAccessToken(useRefreshToken: boolean = false) {
	const verifier = localStorage.getItem('verifier');
	const urlParams = new URLSearchParams(window.location.search);
	const code = urlParams.get('code');

	const body = new URLSearchParams({
		code: code ?? '',
		grant_type: 'authorization_code',
		redirect_uri: `${OFF_EXP_BASE_URL}/login_callback`,
		client_id: pkceClientId,
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

	const response = await fetch(`${keycloak}/protocol/openid-connect/token`, {
		method: 'POST',
		body: body,
		headers: new Headers()
	});

	const jwt = await response.json();
	console.log('JWT response:', jwt);
	return jwt;
}

export function saveAuthTokens(jwt: AuthTokens) {
	// Save accessToken and refreshToken in cookies (expires in jwt.expires_in seconds)
	const expires = new Date(Date.now() + jwt.expires_in * 1000).toUTCString();
	document.cookie = `userAccessToken=${jwt.access_token}; expires=${expires}; path=/; secure; samesite=strict`;

	// if a refresh token is provided, set it in cookies
	if (jwt.refresh_token) {
		// Set refresh token cookie with a longer expiry if available (e.g., 30 days)
		const refreshExpires = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toUTCString();
		document.cookie = `userRefreshToken=${jwt.refresh_token}; expires=${refreshExpires}; path=/; secure; samesite=strict`;
	}

	// save id token in cookies
	document.cookie = `userIdToken=${jwt.id_token}; expires=${expires}; path=/; secure; samesite=strict`;
}
