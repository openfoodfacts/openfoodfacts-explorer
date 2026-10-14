import { error } from '@sveltejs/kit';

import {
	FACETS_SORT_OPTIONS,
	getFacetKnowledgePanels,
	getFacetValue,
	type FacetSortOption
} from '#lib/api/facets.js';
import type { PageLoad } from './$types';
import { requireInt } from '#lib/utils.js';
import { getBulkProductAttributes } from '#lib/api.js';
import { getTaxo } from '#lib/api/taxonomy/api.js';
import { getOrDefault } from '#lib/api/taxonomy/types.js';
import { getLocale } from '#lib/i18n/index.js';
import { getFacetDistribution, MAP_FACETS } from './map-facets';

type FacetResponseData = Awaited<ReturnType<typeof getFacetValue>>;
type KPResponseData = Awaited<ReturnType<typeof getFacetKnowledgePanels>>;

async function getTaxonomyOrUndefined(facet: string, fetch: typeof window.fetch) {
	try {
		return await getTaxo(facet, fetch);
	} catch (error) {
		console.error('Taxonomy fetch failed:', error);
		return undefined;
	}
}

export const load: PageLoad = async ({ fetch, params, url }) => {
	const { facet, value } = params;
	const lang = getLocale().split('-')[0]?.toLowerCase() || 'en';
	const mapFacet = Object.hasOwn(MAP_FACETS, facet) ? MAP_FACETS[facet] : undefined;

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
	const taxonomy = mapFacet ? await getTaxonomyOrUndefined(facet, fetch) : undefined;
	const facetDisplayValue = getOrDefault(taxonomy?.[value]?.name ?? {}, lang) ?? value;

	let results: FacetResponseData = {
		products: [],
		count: 0,
		page: 1,
		page_count: 0,
		page_size: pageSize
	};
	let kp: KPResponseData = { knowledge_panels: {} };
	let productAttributes = {};
	let distributionData = null;

	try {
		results = await getFacetValue(fetch, facet, value, searchOptions);
		kp = await getFacetKnowledgePanels(fetch, facet, value);

		if (results.products.length > 0) {
			const products = results.products;

			const productCodes = products.map((state) => state.code as string);
			productAttributes = await getBulkProductAttributes(fetch, productCodes);

			if (mapFacet) {
				distributionData = getFacetDistribution(products, mapFacet.tagsField, taxonomy, lang);
			}
		}
	} catch (e) {
		console.error('API Fetch failed:', e);
	}

	return {
		searchOptions,
		facet: { name: facet, value: facetDisplayValue },
		results: results,
		knowledgePanels: kp.knowledge_panels || {},
		productAttributes,
		distributionData,
		mapFacet: mapFacet ?? null
	};
};
