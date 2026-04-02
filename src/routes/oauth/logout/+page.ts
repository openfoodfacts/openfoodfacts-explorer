// THIS IS A CLIENT-SIDE ONLY PAGE
export const ssr = false;

import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { resolve } from '$app/paths';
import { createKeycloakApi } from '$lib/api';
import { getAuthTokens } from '$lib/stores/auth';

export const load: PageLoad = async ({ fetch, url }) => {
	const redirectUri = new URL(resolve('/oauth/logout/callback'), url.origin).toString();
	const tokens = getAuthTokens();

	const logoutUrl = createKeycloakApi(fetch, url).logoutUrl({
		postLogoutRedirectUri: redirectUri,
		refreshToken: tokens?.refresh_token,
		idTokenHint: tokens?.id_token
	});
	throw redirect(302, logoutUrl);
};
