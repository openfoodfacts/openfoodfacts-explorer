import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getFacet, getFacetKnowledgePanels } from '$lib/api/facets';
import { requireInt } from '$lib/utils';

// Default empty facet response structure
const EMPTY_FACET_RESPONSE = {
	tags: [],
	count: 0
};

export const load: PageLoad = async ({ fetch, params, url }) => {
	const { facet } = params;
	const pageStr = url.searchParams.get('page') || '1';
	const pageSizeStr = url.searchParams.get('page_size') || '50';

	const page = requireInt(pageStr, () => error(400, 'Invalid page number'));
	const pageSize = requireInt(pageSizeStr, () => error(400, 'Invalid page size'));

	try {
		const [resultsPromise, panelsPromise] = await Promise.allSettled([
			getFacet(fetch, facet, { page, pageSize }),
			getFacetKnowledgePanels(fetch, facet)
		]);

		// Handle facet results
		const results =
			resultsPromise.status === 'fulfilled' ? resultsPromise.value : EMPTY_FACET_RESPONSE;

		// Handle knowledge panels
		let knowledgePanels: Record<string, any> = {};
		if (panelsPromise.status === 'fulfilled') {
			knowledgePanels = panelsPromise.value.knowledge_panels;
		}

		const pages = results.count > 0 ? Math.ceil(results.count / (pageSize || 100)) : 0;

		return {
			facet,
			results,
			pages,
			pageSize,
			page,
			knowledgePanels
		};
	} catch (e) {
		// Provide a fallback response instead of throwing an error
		console.error(`Error loading facet data for ${facet}:`, e);
		return {
			facet,
			results: EMPTY_FACET_RESPONSE,
			pages: 0,
			pageSize,
			page,
			knowledgePanels: {},
			apiError: true,
			apiErrorMessage:
				e instanceof Error ? e.message : 'Unable to fetch facet data. External API may be unavailable.'
		};
	}
};
