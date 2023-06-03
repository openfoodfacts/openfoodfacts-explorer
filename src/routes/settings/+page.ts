import { getTaxo } from '$lib/api';
import type { Language } from '$lib/taxo';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	const languages = getTaxo<Language>('languages', fetch);

	return {
		languages
	};
}) satisfies PageLoad;
