export const ssr = false;
import { userAuthTokens } from '$lib/stores/pkceLoginStore';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	userAuthTokens.set({ accessToken: '', refreshToken: '', idToken: '' });
	window.location.href = '/';
};
