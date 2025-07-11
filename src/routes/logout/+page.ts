import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { KEYCLOAK_URL, OAUTH_CLIENT_ID } from '$lib/const';

export const load: PageLoad = async ({ url }) => {
	const redirectUri = `${url.origin}/logout_callback`;
	const params = new URLSearchParams({
		client_id: OAUTH_CLIENT_ID,
		post_logout_redirect_uri: redirectUri
	});
	const logoutUrl = `${KEYCLOAK_URL}/protocol/openid-connect/logout?${params}`;
	throw redirect(302, logoutUrl);
};
