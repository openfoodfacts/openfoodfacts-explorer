import { getKeys } from '$lib/api';
import type { PageLoad } from '../$types';

export const load: PageLoad = async ({ fetch }) => {
	const keys = getKeys(fetch);

	return {
		keys
	};
};
