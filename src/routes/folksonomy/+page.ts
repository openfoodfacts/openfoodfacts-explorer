import { FolksonomyApi } from '$lib/api/folksonomy';
import type { PageLoad } from '../$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const api = new FolksonomyApi(fetch);
	const keys = await api.getKeys();

	return {
		keys
	};
};
