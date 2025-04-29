import { createFolksonomyApi } from '$lib/api/folksonomy';
import type { PageLoad } from '../$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const folksonomyApi = createFolksonomyApi(fetch);
	const keys = await folksonomyApi.getKeys();

	return {
		keys
	};
};
