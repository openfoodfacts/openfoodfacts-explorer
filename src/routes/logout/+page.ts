import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { KEYCLOAK_URL, AUTH_PKCE_ID, OFF_EXP_BASE_URL } from '$lib/const';

export const load: PageLoad = async () => {
	const redirectUri = `${OFF_EXP_BASE_URL}/logout_callback`;
	const params = new URLSearchParams({
		client_id: AUTH_PKCE_ID,
		post_logout_redirect_uri: redirectUri
	});
	const logoutUrl = `${KEYCLOAK_URL}/protocol/openid-connect/logout?${params}`;
	throw redirect(302, logoutUrl);
};
