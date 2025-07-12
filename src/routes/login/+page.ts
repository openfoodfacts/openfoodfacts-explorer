import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { KEYCLOAK_URL, OAUTH_CLIENT_ID } from '$lib/const';

export const ssr = false;

/**
 * Encodes a Uint8Array to a base64 URL-safe string.
 * @param {Uint8Array} bytes - The bytes to encode.
 * @returns {string} The base64 URL-safe encoded string.
 */
function base64URLEncode(bytes: Uint8Array): string {
	const b64 = btoa(String.fromCharCode(...bytes));
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Redirects the user to the Keycloak login page with PKCE.
 */
export const load: PageLoad = async ({ url }) => {
	const verifier = base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
	localStorage.setItem('verifier', verifier);

	const codeChallenge = base64URLEncode(
		new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))
	);

	const nonce = crypto.getRandomValues(new BigUint64Array(1))[0].toString();

	// Store the state parameter for validation in the callback
	localStorage.setItem('authState', nonce);
	const lang = 'en';
	const redirectUri = `${url.origin}/login_callback`;

	const baseUrl = `${KEYCLOAK_URL}/protocol/openid-connect/auth`;
	const params = new URLSearchParams({
		response_type: 'code',
		client_id: OAUTH_CLIENT_ID,
		redirect_uri: redirectUri,
		scope: 'openid profile offline_access',
		state: nonce,
		ui_locales: lang,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256'
	});

	console.log(`Redirecting to Keycloak with params: ${params.toString()}`);

	const oauthLoginUrl = `${baseUrl}?${params.toString()}`;
	throw redirect(302, oauthLoginUrl);
};
