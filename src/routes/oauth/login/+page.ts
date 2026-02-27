// THIS IS A CLIENT-SIDE ONLY PAGE
export const ssr = false;

import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { createKeycloakApi } from '$lib/api';

/**
 * Encodes a Uint8Array to a base64 URL-safe string.
 * @param {Uint8Array} bytes - The bytes to encode.
 * @returns {string} The base64 URL-safe encoded string.
 */
function base64URLEncode(bytes: Uint8Array): string {
	const b64 = btoa(String.fromCharCode(...bytes));
	return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function createChallengeS256(verifier: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(verifier);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return base64URLEncode(new Uint8Array(hash));
}

/**
 * Redirects the user to the Keycloak login page with PKCE.
 */
export const load: PageLoad = async ({ url }) => {
	// 1. Generate PKCE values
	const verifier = base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
	const codeChallenge = await createChallengeS256(verifier);

	// 2. Generate a random state parameter
	const state = base64URLEncode(crypto.getRandomValues(new Uint8Array(16)));

	// 3. Store the verifier and state in local storage for later verification
	localStorage.setItem('verifier', verifier);
	localStorage.setItem('authState', state);

	// 4. Create and redirect to the Keycloak login URL
	const api = createKeycloakApi(fetch, url);

	const oauthLoginUrl = api.loginUrl({
		state: state,
		scope: 'openid profile offline_access',
		codeChallenge,
		codeChallengeMethod: 'S256'
	});

	redirect(302, oauthLoginUrl);
};
