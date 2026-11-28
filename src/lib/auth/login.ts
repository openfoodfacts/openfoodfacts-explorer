import { decodeJwt } from 'jose';
import { createKeycloakApi } from '#lib/api.js';
import type { KeycloakTokens } from '#lib/api/keycloak.js';
import { trackOffEvent } from '#lib/analytics.js';
import { getAuthTokens, isTokenExpired, saveAuthTokens } from '#lib/stores/auth.js';
import { getSafeRedirectUrl } from '#lib/utils.js';

/**
 * Encodes a Uint8Array to a base64 URL-safe string.
 */
function base64UrlEncode(bytes: Uint8Array): string {
	const b64 = btoa(String.fromCharCode(...bytes));
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function createChallengeS256(verifier: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Checks whether the stored auth tokens represent an active, non-expired session.
 */
export function hasValidAuthSession(tokens: KeycloakTokens | null = getAuthTokens()): boolean {
	if (!tokens?.id_token || isTokenExpired(tokens)) {
		return false;
	}

	try {
		decodeJwt(tokens.id_token);
		return true;
	} catch {
		return false;
	}
}

export type LoginRedirectPlan =
	| { alreadyAuthenticated: true; targetPath: string }
	| { alreadyAuthenticated: false; loginUrl: string };

/**
 * Prepares a PKCE OAuth login redirect, or short-circuits to the destination if
 * the user already has a valid session (e.g. after navigating back to /oauth/login).
 */
export async function prepareLoginRedirect(url: URL): Promise<LoginRedirectPlan> {
	const redirectUrl = url.searchParams.get('redirect');
	const safeRedirect = getSafeRedirectUrl(redirectUrl, url.origin);

	if (hasValidAuthSession()) {
		return { alreadyAuthenticated: true, targetPath: safeRedirect };
	}

	const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
	const codeChallenge = await createChallengeS256(verifier);
	const state = base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));

	localStorage.setItem('verifier', verifier);
	localStorage.setItem('authState', state);
	localStorage.setItem('authRedirect', safeRedirect);

	const loginUrl = createKeycloakApi(fetch, url).loginUrl({
		state,
		scope: 'openid profile offline_access',
		codeChallenge,
		codeChallengeMethod: 'S256'
	});

	return { alreadyAuthenticated: false, loginUrl };
}

export type LoginCallbackResult = {
	targetPath: string;
	reusedSession: boolean;
};

/**
 * Completes the PKCE OAuth login callback, or redirects cleanly if the browser
 * navigated back through Keycloak after the one-time state was already consumed.
 */
export async function completeLoginCallback(
	url: URL,
	fetchFn: typeof window.fetch
): Promise<LoginCallbackResult> {
	const returnedState = url.searchParams.get('state');
	const storedState = localStorage.getItem('authState');

	// Clicking Back after login can return to Keycloak's SSO page, which auto-redirects
	// back here with the old state parameter after authState was already consumed.
	// Redirect safely without exchanging the code or touching existing tokens.
	if (!storedState && hasValidAuthSession()) {
		const redirectUrl = localStorage.getItem('authRedirect');
		localStorage.removeItem('authRedirect');
		return {
			targetPath: getSafeRedirectUrl(redirectUrl, url.origin),
			reusedSession: true
		};
	}

	if (!returnedState || returnedState !== storedState) {
		console.error('State validation failed');
		throw new Error('Authentication failed: Invalid state parameter');
	}

	localStorage.removeItem('authState');

	const verifier = localStorage.getItem('verifier');
	const code = url.searchParams.get('code');

	if (!verifier) {
		console.error('Missing PKCE verifier in localStorage');
		throw new Error('Authentication failed: Missing PKCE verifier');
	}
	if (!code) {
		console.error('Missing authorization code in URL');
		throw new Error('Authentication failed: Missing authorization code');
	}

	try {
		const jwt = await createKeycloakApi(fetchFn, url).exchangeCode({
			code,
			verifier
		});
		localStorage.removeItem('verifier');
		saveAuthTokens(jwt);
		trackOffEvent('account', 'login_succeeded');

		const redirectUrl = localStorage.getItem('authRedirect');
		localStorage.removeItem('authRedirect');

		return {
			targetPath: getSafeRedirectUrl(redirectUrl, url.origin),
			reusedSession: false
		};
	} catch (error) {
		console.error('Token exchange failed:', error);
		throw new Error('Authentication failed: Token exchange error', { cause: error });
	}
}
