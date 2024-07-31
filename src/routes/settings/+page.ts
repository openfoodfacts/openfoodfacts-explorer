import { getTaxo, type Language } from '$lib/api';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	const languages = await getTaxo<Language>('languages', fetch);

	return {
		languages
	};
}) satisfies PageLoad;
