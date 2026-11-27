import { error } from '@sveltejs/kit';
import { PUBLIC_QUERY_BASE_URL } from '$app/env/public';
import { getFacetDrilldown } from '#lib/api/facets.js';
import { getQueryFilter, isKnownFacet, queryFacetCounts } from '#lib/server/query-facets.js';
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

	// Like nested pages, every facet in the path must be known
	const filter = getQueryFilter(drilldown.pairs);
	if (filter == null || !isKnownFacet(drilldown.listFacet)) error(404, 'Unknown facet');

	// Without a Query URL this is null, and the page loads the list from Product Opener
	const queryResults = await queryFacetCounts(
		fetch,
		PUBLIC_QUERY_BASE_URL,
		drilldown.listFacet,
		page,
		pageSize,
		filter
	);

	return { drilldown, page, pageSize, queryResults };
};
