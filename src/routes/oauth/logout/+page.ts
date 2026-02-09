// THIS IS A CLIENT-SIDE ONLY PAGE
export const ssr = false;

import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { resolve } from '$app/paths';
import { createKeycloakApi } from '$lib/api/keycloak';

export const load: PageLoad = async ({ fetch }) => {
	const redirectUri = resolve('/oauth/logout/callback');

	const logoutUrl = createKeycloakApi(fetch, new URL(window.location.href)).logoutUrl({
		// Keycloak requires the refresh token for logout, but since we are doing a front-channel logout, we can leave it empty
		refreshToken: '',
		postLogoutRedirectUri: redirectUri
	});
	throw redirect(302, logoutUrl);
};
