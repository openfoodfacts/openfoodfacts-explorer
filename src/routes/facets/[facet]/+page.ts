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

	const kp = getFacetKnowledgePanels(fetch, facet);

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
};
