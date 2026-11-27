import { API_HOST } from '#lib/const.js';
import { getOrDefault, type Taxonomy } from './types';

// TODO: Select taxonomy facets for the current product domain; this list is hardcoded for food.
export const FACETS_WITH_TAXONOMY = new Set([
	'categories',
	'countries',
	'labels',
	'origins',
	'ingredients',
	'additives',
	'allergens',
	'languages',
	'packaging',
	'states'
]);

export function getFacetLabel(id: string, taxonomy: Taxonomy | undefined, lang: string): string {
	return (
		getOrDefault(taxonomy?.[id]?.name ?? {}, lang) ??
		id.replace(/^[a-z]{2}:/, '').replaceAll('-', ' ')
	);
}

export async function getFacetLabelEntry(
	fetch: typeof globalThis.fetch,
	facet: string,
	id: string,
	lang: string
): Promise<Taxonomy | undefined> {
	if (!FACETS_WITH_TAXONOMY.has(facet)) return undefined;
	const params = new URLSearchParams({
		tagtype: facet,
		tags: id,
		lc: lang === 'en' ? 'en' : `${lang},en`,
		fields: 'name'
	});
	const response = await fetch(`${API_HOST}/api/v2/taxonomy?${params}`);
	if (!response.ok) return undefined;
	return (await response.json()) as Taxonomy;
}
