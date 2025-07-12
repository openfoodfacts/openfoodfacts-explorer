import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { clearAuthTokens } from '$lib/stores/pkceLoginStore';

export const ssr = false;

export const load: PageLoad = () => {
	clearAuthTokens();
	throw redirect(302, '/');
};
