import { error } from '@sveltejs/kit';
import { QUERY_BASE_URL } from '$app/env/private';
import { FACETS_SORT_OPTIONS, type FacetSortOption } from '#lib/api/facets.js';
import { queryFacetProducts } from '#lib/server/query-facet-products.js';
import { queryAllFacetValues, QUERY_FACETS } from '#lib/server/query-facets.js';
import { requireInt } from '#lib/utils.js';
import { MAP_FACETS } from '../map-facets';
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

	const field = Object.hasOwn(QUERY_FACETS, params.facet) ? QUERY_FACETS[params.facet] : undefined;
	const hasMap = Object.hasOwn(MAP_FACETS, params.facet);

	const queryProductsPromise = queryFacetProducts(
		fetch,
		QUERY_BASE_URL,
		params.facet,
		params.value,
		searchOptions
	);

	const mapValuesPromise =
		field && hasMap
			? queryAllFacetValues(fetch, QUERY_BASE_URL, params.facet, { [field]: params.value })
			: Promise.resolve(null);

	const [queryProducts, mapValues] = await Promise.all([queryProductsPromise, mapValuesPromise]);
	return { queryProducts, mapValues, searchOptions };
};
