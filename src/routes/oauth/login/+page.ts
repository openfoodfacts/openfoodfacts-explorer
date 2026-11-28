// THIS IS A CLIENT-SIDE ONLY PAGE
export const ssr = false;

import type { PageLoad } from './$types';
import { prepareLoginRedirect } from '#lib/auth/login.js';

/**
 * Redirects the user to the Keycloak login page with PKCE,
 * or back to the destination if already authenticated.
 */
export const load: PageLoad = async ({ url }) => {
	const result = await prepareLoginRedirect(url);
	const destination = result.alreadyAuthenticated ? result.targetPath : result.loginUrl;

	// Replace /oauth/login in browser history so Back does not re-trigger login.
	window.location.replace(destination);
	return new Promise<never>(() => {});
};
