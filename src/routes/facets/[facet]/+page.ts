import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { FACET_STATUS_OPTIONS, getFacet, getFacetKnowledgePanels } from '#lib/api/facets.js';
import { requireInt } from '#lib/utils.js';
import { getLocale } from '#lib/i18n/index.js';
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

type QueryResults = { count: number; values: QueryFacetValue[] };

async function toFacetResults(
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

function toMapResults(values: QueryFacetValue[]): FacetResponse {
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

export const load: PageLoad = async ({ fetch, params, url, data }) => {
	const { facet } = params;
	const pageStr = url.searchParams.get('page') || '1';
	const pageSizeStr = url.searchParams.get('page_size') || '50';
	const filter = url.searchParams.get('filter')?.trim() || '';
	const statusParam = url.searchParams.get('status');
	const status = FACET_STATUS_OPTIONS.find((s) => s === statusParam);

	const page = requireInt(pageStr, () => error(400, 'Invalid page number'));
	const pageSize = requireInt(pageSizeStr, () => error(400, 'Invalid page size'));

	const isFiltered = filter !== '' || status != null;

	const kp = getFacetKnowledgePanels(fetch, facet);
	try {
		// Always load the regular paginated facet here. The whole-facet filter is expensive
		// for the backend, so the page runs it in the browser for logged-in users only,
		// never during server-side rendering (e.g. for crawlers following a filter link).
		const results = data.queryResults
			? await toFacetResults(fetch, facet, data.queryResults, getLocale())
			: await getFacet(fetch, facet, { page, pageSize });
		const pages = Math.ceil(results.count / (pageSize || 100));

		return {
			facet,
			results,
			mapResults: data.mapValues ? toMapResults(data.mapValues) : results,
			mapIsPageLimited: !data.mapValues,
			pages,
			pageSize,
			page,
			filter,
			status,
			isFiltered,
			knowledgePanels: (await kp).knowledge_panels
		};
	} catch (e) {
		throw error(500, 'An error occurred while fetching the facet data', {
			errors: [e instanceof Error ? e.message : 'Unknown error']
		});
	}
};
