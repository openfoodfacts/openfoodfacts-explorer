import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import {
	FACET_STATUS_OPTIONS,
	filterFacet,
	getFacet,
	getFacetKnowledgePanels
} from '#lib/api/facets.js';
import { requireInt } from '#lib/utils.js';

export const load: PageLoad = async ({ fetch, params, url }) => {
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
		const results = isFiltered
			? await filterFacet(fetch, facet, { filter, status })
			: await getFacet(fetch, facet, { page, pageSize });
		// A filtered facet comes back in one go, so there is a single page
		const pages = isFiltered ? 1 : Math.ceil(results.count / (pageSize || 100));

		return {
			facet,
			results,
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
