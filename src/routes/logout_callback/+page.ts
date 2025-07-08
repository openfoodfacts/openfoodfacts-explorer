export const ssr = false;
import { userAuthTokens } from '$lib/stores/pkceLoginStore';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	userAuthTokens.set(null);
	window.location.href = '/';
};
