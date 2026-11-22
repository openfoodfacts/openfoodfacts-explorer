import { error } from '@sveltejs/kit';
import { PUBLIC_QUERY_BASE_URL } from '$app/env/public';
import { getFacetDrilldown } from '#lib/api/facets.js';
import { getQueryFilter, queryFacetCounts } from '#lib/server/query-facets.js';
import { requireInt } from '#lib/utils.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	const page = requireInt(url.searchParams.get('page') || '1', () =>
		error(400, 'Invalid page number')
	);
	const pageSize = requireInt(url.searchParams.get('page_size') || '50', () =>
		error(400, 'Invalid page size')
	);
	if (page < 1 || pageSize < 1) error(400, 'Page and page size must be positive');

	const drilldown = getFacetDrilldown(params.facet, params.value, params.path);
	if (drilldown == null) error(404, 'Invalid facet path');

	// Without a Query field for every pair, the page loads the list from Product Opener
	const filter = getQueryFilter(drilldown.pairs);
	let queryResults = null;
	if (filter != null) {
		queryResults = await queryFacetCounts(
			fetch,
			PUBLIC_QUERY_BASE_URL,
			drilldown.listFacet,
			page,
			pageSize,
			filter
		);
	}

	return { drilldown, page, pageSize, queryResults };
};
