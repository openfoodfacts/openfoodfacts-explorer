import type { FacetResponse, QueryFacetValue } from '@openfoodfacts/openfoodfacts-nodejs';
import { getTaxo } from '#lib/api/taxonomy/api.js';
import { getOrDefault } from '#lib/api/taxonomy/types.js';

// TODO: Select taxonomy facets for the current product domain; this list is hardcoded for food.
const FACETS_WITH_TAXONOMY = new Set([
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

export type QueryResults = { count: number; values: QueryFacetValue[] };

/** Turn Query facet counts into the tag list Product Opener returns, with taxonomy names. */
export async function toFacetResults(
	fetch: typeof globalThis.fetch,
	facet: string,
	results: QueryResults,
	lang: string
): Promise<FacetResponse> {
	const taxonomy = FACETS_WITH_TAXONOMY.has(facet)
		? await getTaxo(facet, fetch).catch(() => undefined)
		: undefined;

	// The API uses 1/0; -1 represents a taxonomy that could not be loaded.
	const known = (id: string) => {
		if (!taxonomy) return -1;
		return taxonomy[id] ? 1 : 0;
	};

	return {
		count: results.count,
		tags: results.values.map(({ _id, count }) => ({
			id: _id,
			known: known(_id),
			name:
				getOrDefault(taxonomy?.[_id]?.name ?? {}, lang) ??
				_id.replace(/^[a-z]{2}:/, '').replaceAll('-', ' '),
			products: count
		}))
	};
}
