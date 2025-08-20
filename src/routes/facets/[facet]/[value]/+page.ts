import { error } from '@sveltejs/kit';

import { getFacetKnowledgePanels, getFacetValue } from '$lib/api/facets';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const { facet, value } = params;
	const pageStr = url.searchParams.get('page') || '1';
	const pageSizeStr = url.searchParams.get('page_size') || '50';

	let page: number;
	try {
		page = parseInt(pageStr, 10);
	} catch {
		error(400, 'Invalid page number');
	}

	let pageSize: number;
	try {
		pageSize = parseInt(pageSizeStr, 10);
	} catch {
		error(400, 'Invalid page size');
	}

	const results = getFacetValue(fetch, facet, value, { page, page_size: pageSize });
	const kp = getFacetKnowledgePanels(fetch, facet, value);

	return {
		facet: { name: facet, value },
		results: await results,
		knowledgePanels: (await kp).knowledge_panels
	};
};
