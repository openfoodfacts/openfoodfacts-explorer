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
import { getTaxo } from '$lib/api/taxonomy/api';
import { getOrDefault } from '$lib/api/taxonomy/types';

type FacetResponseData = Awaited<ReturnType<typeof getFacetValue>>;
type KPResponseData = Awaited<ReturnType<typeof getFacetKnowledgePanels>>;

export const load: PageLoad = async ({ fetch, params, url }) => {
	const { facet, value } = params;

	let facetDisplayValue = value;

	if (facet === 'origins' || facet === 'countries') {
		const taxonomy = await getTaxo(facet, fetch);
		facetDisplayValue = getOrDefault(taxonomy[value]?.name ?? {}) ?? value;
	}

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
				const tagCounts: Record<string, number> = {};

				results.products.forEach((product) => {
					const tags = facet === 'origins' ? product.origins_tags : product.countries_tags;

					if (Array.isArray(tags)) {
						tags.forEach((tag) => {
							const tagId =
								typeof tag === 'string' ? tag : typeof tag.id === 'string' ? tag.id : undefined;

							if (tagId) {
								tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
							}
						});
					}
				});

				const taxonomy = await getTaxo(facet, fetch);

				const mappedTags = Object.entries(tagCounts).map(([id, count]) => {
					const taxoNode = taxonomy[id];

					return {
						id,
						products: count,
						known: 1,
						name: taxoNode?.name ? (getOrDefault(taxoNode.name) ?? id) : id
					};
				});

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
		facet: { name: facet, value: facetDisplayValue },
		results: results,
		knowledgePanels: kp.knowledge_panels || {},
		productAttributes,
		distributionData
	};
};
