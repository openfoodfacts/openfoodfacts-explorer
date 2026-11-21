import { error } from '@sveltejs/kit';
import { PUBLIC_QUERY_BASE_URL } from '$app/env/public';
import { FACETS_SORT_OPTIONS, getFacetPairs, type FacetSortOption } from '#lib/api/facets.js';
import { queryFacetProducts } from '#lib/server/query-facet-products.js';
import { getQueryFilter, queryAllFacetValues } from '#lib/server/query-facets.js';
import { requireInt } from '#lib/utils.js';
import { MAP_FACETS } from '../../map-facets';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	const page = requireInt(url.searchParams.get('page') || '1', () =>
		error(400, 'Invalid page number')
	);
	const pageSize = requireInt(url.searchParams.get('page_size') || '50', () =>
		error(400, 'Invalid page size')
	);
	if (page < 1 || pageSize < 1) error(400, 'Page and page size must be positive');

	const sortBy = url.searchParams.get('sort_by');
	if (sortBy && !FACETS_SORT_OPTIONS.includes(sortBy as FacetSortOption)) {
		error(400, 'Invalid sort option');
	}
	const searchOptions = { page, pageSize, sortBy: (sortBy as FacetSortOption) || undefined };

	const facetPairs = getFacetPairs(params.facet, params.value, params.rest);
	if (facetPairs == null) error(404, 'Invalid facet path');

	// Nested pages filter on every pair, so each facet needs a Query field
	const facetFilter = getQueryFilter(facetPairs);
	if (facetPairs.length > 1 && facetFilter == null) error(404, 'Unknown facet');

	const hasMap = Object.hasOwn(MAP_FACETS, params.facet);

	const queryProductsPromise = queryFacetProducts(
		fetch,
		PUBLIC_QUERY_BASE_URL,
		facetFilter,
		searchOptions
	);

	const mapValuesPromise =
		hasMap && facetFilter
			? queryAllFacetValues(fetch, PUBLIC_QUERY_BASE_URL, params.facet, facetFilter)
			: Promise.resolve(null);

	const [queryProducts, mapValues] = await Promise.all([queryProductsPromise, mapValuesPromise]);
	return { queryProducts, mapValues, searchOptions, facetPairs, facetFilter };
};
