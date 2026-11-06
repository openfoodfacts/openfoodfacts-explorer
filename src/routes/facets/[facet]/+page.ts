import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getFacet, getFacetKnowledgePanels } from '#lib/api/facets.js';
import { requireInt } from '#lib/utils.js';
import { getTaxo } from '#lib/api/taxonomy/api.js';
import { getOrDefault } from '#lib/api/taxonomy/types.js';
import { getLocale } from '#lib/i18n/index.js';

const FACETS_WITH_TAXONOMY = new Set([
	'categories',
	'countries',
	'labels',
	'origins',
	'ingredients',
	'additives',
	'allergens',
	'languages',
	'packaging',
	'states'
]);

export const load: PageLoad = async ({ fetch, params, url, data }) => {
	const { facet } = params;
	const pageStr = url.searchParams.get('page') || '1';
	const pageSizeStr = url.searchParams.get('page_size') || '50';

	const page = requireInt(pageStr, () => error(400, 'Invalid page number'));
	const pageSize = requireInt(pageSizeStr, () => error(400, 'Invalid page size'));

	const kp = getFacetKnowledgePanels(fetch, facet);
	try {
		let results;
		if (data.queryResults) {
			const taxonomy = FACETS_WITH_TAXONOMY.has(facet)
				? await getTaxo(facet, fetch).catch(() => undefined)
				: undefined;
			const lang = getLocale();
			results = {
				count: data.queryResults.count,
				tags: data.queryResults.values.map(({ _id, count }) => ({
					id: _id,
					known: taxonomy ? (taxonomy[_id] ? 1 : 0) : -1,
					name:
						getOrDefault(taxonomy?.[_id]?.name ?? {}, lang) ??
						_id.replace(/^[a-z]{2}:/, '').replaceAll('-', ' '),
					products: count
				}))
			};
		} else {
			results = await getFacet(fetch, facet, { page, pageSize });
		}
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
		throw error(500, 'An error occurred while fetching the facet data', {
			errors: [e instanceof Error ? e.message : 'Unknown error']
		});
	}
};
