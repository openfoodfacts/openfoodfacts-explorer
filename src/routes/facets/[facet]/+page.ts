import type { FacetResponse } from '@openfoodfacts/openfoodfacts-nodejs';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getFacet, getFacetKnowledgePanels } from '$lib/api/facets';
import { requireInt } from '$lib/utils';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const { facet } = params;
	const pageStr = url.searchParams.get('page') || '1';
	const pageSizeStr = url.searchParams.get('page_size') || '50';

	const page = requireInt(pageStr, () => error(400, 'Invalid page number'));
	const pageSize = requireInt(pageSizeStr, () => error(400, 'Invalid page size'));

	const kp = getFacetKnowledgePanels(fetch, facet).catch((e) => {
		console.error('Failed to fetch facet knowledge panels:', e);
		return { knowledge_panels: {} };
	});

	try {
		const results = await getFacet(fetch, facet, { page, pageSize });
		const pages = Math.ceil(results.count / (pageSize || 100));

		return {
			facet,
			results,
			pages,
			pageSize,
			page,
			knowledgePanels: (await kp).knowledge_panels
		};
	} catch (e) {
		console.error('An error occurred while fetching the facet data:', e);
		return {
			facet,
			results: {
				count: 0,
				tags: [],
				page,
				page_size: pageSize,
				page_count: 0
			} as unknown as FacetResponse,
			pages: 0,
			pageSize,
			page,
			knowledgePanels: (await kp).knowledge_panels
		};
	}
};
