import { error } from '@sveltejs/kit';

import {
	FACETS_SORT_OPTIONS,
	getFacetKnowledgePanels,
	getFacetValue,
	type FacetSortOption
} from '$lib/api/facets';

import type { PageLoad } from './$types';
import { requireInt } from '$lib/utils';
import { getBulkProductAttributes } from '$lib/api';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const { facet, value } = params;

	// Pagination
	const pageStr = url.searchParams.get('page') || '1';
	const page = requireInt(pageStr, () => error(400, 'Invalid page number'));

	const pageSizeStr = url.searchParams.get('page_size') || '50';
	const pageSize = requireInt(pageSizeStr, () => error(400, 'Invalid page size'));

	// Sorting
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

	// Start requests in parallel
	const resultsPromise = getFacetValue(fetch, facet, value, searchOptions);
	const knowledgePanelsPromise = getFacetKnowledgePanels(fetch, facet, value);

	// Await main results
	const results = await resultsPromise;

	// Prevent crash if products is undefined
	const products = results.products ?? [];

	const productCodes = products.map((state) => state.code as string);

	// Only fetch attributes if we actually have product codes
	const productAttributes =
		productCodes.length > 0 ? await getBulkProductAttributes(fetch, productCodes) : {};

	return {
		searchOptions,
		facet: { name: facet, value },
		results,
		knowledgePanels: (await knowledgePanelsPromise).knowledge_panels,
		productAttributes
	};
};
