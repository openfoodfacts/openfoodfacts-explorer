import { createFolksonomyApi } from '$lib/api/folksonomy';
import { error } from '@sveltejs/kit';
import type { PageLoad } from '../$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch }) => {
	const folksonomyApi = createFolksonomyApi(fetch);
	const { data, error: apiError } = await folksonomyApi.getKeys();
	if (apiError != null || data == null) error(500, 'Error loading folksonomy keys: ' + apiError);

	return { keys: data };
};
