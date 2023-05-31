import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	const languages = (await (
		await fetch('https://static.openfoodfacts.org/data/taxonomies/languages.json')
	).json()) as Record<
		string,
		{
			name: Record<string, string>;
			language_code_2: {
				en: string;
			};
			language_code_3: {
				en: string;
			};
		}
	>;

	return {
		languages
	};
}) satisfies PageLoad;
