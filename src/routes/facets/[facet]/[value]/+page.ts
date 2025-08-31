import { error } from '@sveltejs/kit';

import {
	FACETS_SORT_OPTIONS,
	getFacetKnowledgePanels,
	getFacetValue,
	type FacetSortOption
} from '$lib/api/facets';
import type { PageLoad } from './$types';
import { requireInt } from '$lib/utils';
import { ProductsApi } from '$lib/api';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const { facet, value } = params;

	const pageStr = url.searchParams.get('page') || '1';
	const page = requireInt(pageStr, () => error(400, 'Invalid page number'));

	const pageSizeStr = url.searchParams.get('page_size') || '50';
	const pageSize = requireInt(pageSizeStr, () => error(400, 'Invalid page size'));

	const sortByStr = url.searchParams.get('sort_by');
	if (sortByStr && !FACETS_SORT_OPTIONS.includes(sortByStr as FacetSortOption)) {
		error(400, 'Invalid sort option');
	}
	const sortBy = sortByStr as FacetSortOption | undefined;

	const searchOptions = {
		page,
		pageSize,
		sortBy
	};

	const results = getFacetValue(fetch, facet, value, searchOptions);
	const kp = getFacetKnowledgePanels(fetch, facet, value);

	const productApi = new ProductsApi(fetch);

	const productCodes = (async () => {
		const productCodes = (await results).products.map((state) => state.code as string);
		const attrs = await productApi.getBulkProductAttributes(productCodes);
		return attrs;
	})();

	return {
		searchOptions,
		facet: { name: facet, value },
		results: await results,
		knowledgePanels: (await kp).knowledge_panels,
		productAttributes: await productCodes
	};
};
