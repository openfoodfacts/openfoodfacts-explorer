import { error } from '@sveltejs/kit';
import type { FacetResponse } from '@openfoodfacts/openfoodfacts-nodejs';
import { getFacetForPairs } from '#lib/api/facets.js';
import { getLocale } from '#lib/i18n/index.js';
import { toFacetResults } from '../../facet-results';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, data }) => {
	const { drilldown, page, pageSize, queryResults } = data;

	try {
		let results: FacetResponse;
		if (queryResults) {
			results = await toFacetResults(fetch, drilldown.listFacet, queryResults, getLocale());
		} else {
			results = await getFacetForPairs(fetch, drilldown, { page, pageSize });
		}
		const pages = Math.ceil(results.count / pageSize);

		return { drilldown, results, page, pageSize, pages };
	} catch (e) {
		throw error(500, 'An error occurred while fetching the facet data', {
			errors: [e instanceof Error ? e.message : 'Unknown error']
		});
	}
};
