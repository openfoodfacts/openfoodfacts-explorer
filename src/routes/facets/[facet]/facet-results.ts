import type { FacetResponse, QueryFacetValue } from '@openfoodfacts/openfoodfacts-nodejs';
import { getTaxo } from '#lib/api/taxonomy/api.js';
import { getOrDefault } from '#lib/api/taxonomy/types.js';

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

type QueryResults = { count: number; values: QueryFacetValue[] };

export async function toFacetResults(
	fetch: typeof globalThis.fetch,
	facet: string,
	results: QueryResults,
	lang: string
): Promise<FacetResponse> {
	const taxonomy = FACETS_WITH_TAXONOMY.has(facet)
		? await getTaxo(facet, fetch).catch(() => undefined)
		: undefined;

	return {
		count: results.count,
		tags: results.values.map(({ _id, count }) => ({
			id: _id,
			known: taxonomy ? (taxonomy[_id] ? 1 : 0) : -1,
			name:
				getOrDefault(taxonomy?.[_id]?.name ?? {}, lang) ??
				_id.replace(/^[a-z]{2}:/, '').replaceAll('-', ' '),
			products: count
		}))
	};
}

export function toMapResults(values: QueryFacetValue[]): FacetResponse {
	return {
		count: values.length,
		tags: values.map(({ _id, count }) => ({
			id: _id,
			name: _id,
			known: 1,
			products: count
		}))
	};
}
