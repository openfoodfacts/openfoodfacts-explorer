import { error } from '@sveltejs/kit';
import { QUERY_BASE_URL } from '$app/env/private';
import { queryAllFacetValues, queryFacetCounts } from '#lib/server/query-facets.js';
import { requireInt } from '#lib/utils.js';
import type { PageServerLoad } from './$types';

import { MAP_FACETS } from './map-facets';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	const page = requireInt(url.searchParams.get('page') || '1', () =>
		error(400, 'Invalid page number')
	);
	const pageSize = requireInt(url.searchParams.get('page_size') || '50', () =>
		error(400, 'Invalid page size')
	);
	if (page < 1 || pageSize < 1) error(400, 'Page and page size must be positive');

	const queryResultsPromise = queryFacetCounts(fetch, QUERY_BASE_URL, params.facet, page, pageSize);
	const mapValuesPromise = Object.hasOwn(MAP_FACETS, params.facet)
		? queryAllFacetValues(fetch, QUERY_BASE_URL, params.facet)
		: Promise.resolve(null);
	const [queryResults, mapValues] = await Promise.all([queryResultsPromise, mapValuesPromise]);
	return { queryResults, mapValues };
};
