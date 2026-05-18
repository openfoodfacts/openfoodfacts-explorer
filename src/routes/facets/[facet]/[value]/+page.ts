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

type FacetResponseData = Awaited<ReturnType<typeof getFacetValue>>;
type KPResponseData = Awaited<ReturnType<typeof getFacetKnowledgePanels>>;

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

	let results = {
		products: [],
		count: 0,
		page: 1,
		page_size: pageSize
	} as unknown as FacetResponseData;
	let kp = { knowledge_panels: {} } as unknown as KPResponseData;
	let productAttributes = {};
	let distributionData = null;

	try {
		results = await getFacetValue(fetch, facet, value, searchOptions);
		kp = await getFacetKnowledgePanels(fetch, facet, value);

		if (results && results.products && results.products.length > 0) {
			const productCodes = results.products.map((state) => state.code as string);
			productAttributes = await getBulkProductAttributes(fetch, productCodes);

			if (facet === 'origins' || facet === 'countries') {
				const countryCounts: Record<string, number> = {};
				results.products.forEach((product) => {
					if (Array.isArray(product.countries_tags)) {
						product.countries_tags.forEach((tag: string) => {
							countryCounts[tag] = (countryCounts[tag] || 0) + 1;
						});
					}
				});

				const mappedTags = Object.entries(countryCounts).map(([id, count]) => ({
					id,
					products: count,
					known: 1,
					name: id
				}));

				if (mappedTags.length > 0) {
					distributionData = { count: mappedTags.length, tags: mappedTags };
				}
			}
		}
	} catch (e) {
		console.error('API Fetch failed (Likely server outage):', e);
	}

	return {
		searchOptions,
		facet: { name: facet, value },
		results: results,
		knowledgePanels: kp.knowledge_panels || {},
		productAttributes,
		distributionData
	};
};
