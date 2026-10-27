import { createKeycloakApi } from '#lib/api.js';
import { OAUTH_LOGOUT_REDIRECT_URI } from '#lib/const.js';
import { trackOffEvent } from '#lib/analytics.js';
import { clearAuthTokens } from '#lib/stores/auth.js';

function base64UrlEncode(bytes: Uint8Array): string {
	const base64 = btoa(String.fromCharCode(...bytes));
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function startLogout(): void {
	const state = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
	sessionStorage.setItem('logoutState', state);

	const url = new URL(window.location.href);
	const logoutUrl = createKeycloakApi(fetch, url).logoutUrl({
		refreshToken: '',
		postLogoutRedirectUri: OAUTH_LOGOUT_REDIRECT_URI(url),
		state
	});

	window.location.assign(logoutUrl);
}

export function completeLogout(returnedState: string | null): void {
	const storedState = sessionStorage.getItem('logoutState');
	sessionStorage.removeItem('logoutState');

	if (!returnedState || !storedState || returnedState !== storedState) {
		throw new Error('Logout callback state validation failed');
	}

	clearAuthTokens();
	trackOffEvent('account', 'logout_succeeded');
}
