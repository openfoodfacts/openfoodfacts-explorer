export const ssr = false;
import { getAccessToken, saveAuthTokens } from '$lib/stores/pkceLoginStore';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const returnedState = url.searchParams.get('state');
	const storedState = localStorage.getItem('authState');

	if (!returnedState || returnedState !== storedState) {
		console.error('State validation failed');
		throw new Error('Authentication failed: Invalid state parameter');
	}

	localStorage.removeItem('authState');

	try {
		const jwt = await getAccessToken();
		saveAuthTokens(jwt);
		window.location.href = '/';
	} catch (error) {
		console.error('Error getting access token:', error);
		throw new Error('Authentication failed: Unable to get access token');
	}
};
