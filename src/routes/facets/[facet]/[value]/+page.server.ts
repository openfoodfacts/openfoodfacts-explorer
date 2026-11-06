import { error } from '@sveltejs/kit';
import { QUERY_BASE_URL, QUERY_IMAGES_BASE_URL } from '$app/env/private';
import { PUBLIC_IMAGES_URL } from '$app/env/public';
import { FACETS_SORT_OPTIONS, type FacetSortOption } from '#lib/api/facets.js';
import { queryFacetProducts } from '#lib/server/query-facet-products.js';
import { queryAllFacetValues, QUERY_FACETS } from '#lib/server/query-facets.js';
import { requireInt } from '#lib/utils.js';
import { MAP_FACETS } from './map-facets';
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
	if (sortBy && !FACETS_SORT_OPTIONS.includes(sortBy as FacetSortOption))
		error(400, 'Invalid sort option');
	const field = Object.hasOwn(QUERY_FACETS, params.facet) ? QUERY_FACETS[params.facet] : undefined;
	const hasMap = Object.hasOwn(MAP_FACETS, params.facet);
	const [queryProducts, mapValues] = await Promise.all([
		queryFacetProducts(
			fetch,
			QUERY_BASE_URL,
			QUERY_IMAGES_BASE_URL || PUBLIC_IMAGES_URL,
			params.facet,
			params.value,
			{ page, pageSize, sortBy: (sortBy as FacetSortOption) || undefined }
		),
		field && hasMap
			? queryAllFacetValues(fetch, QUERY_BASE_URL, params.facet, { [field]: params.value })
			: null
	]);
	return { queryProducts, mapValues };
};
