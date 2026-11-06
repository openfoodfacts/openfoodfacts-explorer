import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getFacet, getFacetKnowledgePanels } from '#lib/api/facets.js';
import { requireInt } from '#lib/utils.js';
import { getLocale } from '#lib/i18n/index.js';
import { toFacetResults, toMapResults } from './facet-results';

export const load: PageLoad = async ({ fetch, params, url, data }) => {
	const { facet } = params;
	const pageStr = url.searchParams.get('page') || '1';
	const pageSizeStr = url.searchParams.get('page_size') || '50';

	const page = requireInt(pageStr, () => error(400, 'Invalid page number'));
	const pageSize = requireInt(pageSizeStr, () => error(400, 'Invalid page size'));

	const kp = getFacetKnowledgePanels(fetch, facet);
	try {
		const results = data.queryResults
			? await toFacetResults(fetch, facet, data.queryResults, getLocale())
			: await getFacet(fetch, facet, { page, pageSize });
		const pages = Math.ceil(results.count / (pageSize || 100));

		return {
			facet,
			results,
			mapResults: data.mapValues ? toMapResults(data.mapValues) : results,
			mapIsPageLimited: !data.mapValues,
			pages,
			pageSize,
			page,
			knowledgePanels: (await kp).knowledge_panels
		};
	} catch (e) {
		throw error(500, 'An error occurred while fetching the facet data', {
			errors: [e instanceof Error ? e.message : 'Unknown error']
		});
	}
};
