import { error } from '@sveltejs/kit';
import { QUERY_BASE_URL } from '$app/env/private';
import { queryFacetCounts } from '#lib/server/query-facets.js';
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

	return {
		queryResults: await queryFacetCounts(fetch, QUERY_BASE_URL, params.facet, page, pageSize)
	};
};
