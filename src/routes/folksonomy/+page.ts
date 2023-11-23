import { FolksonomyApi } from '$lib/api';
import type { PageLoad } from '../$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const api = new FolksonomyApi(fetch);
	const keys = api.getKeys();

	return {
		keys
	};
};
