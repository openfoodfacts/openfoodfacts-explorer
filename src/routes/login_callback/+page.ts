import type { LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { pkceTokenExchange, saveAuthTokens } from '$lib/stores/pkceLoginStore';
import { goto } from '$app/navigation';

export const ssr = false;

export const load: PageLoad = async ({ url }: LoadEvent) => {
	const returnedState = url.searchParams.get('state');
	const storedState = localStorage.getItem('authState');

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
		const jwt = await pkceTokenExchange(verifier, code, url);
		saveAuthTokens(jwt);
		await goto('/');
	} catch (error) {
		console.error('Error getting access token:', error);
		throw new Error('Authentication failed: Unable to get access token');
	}
};
