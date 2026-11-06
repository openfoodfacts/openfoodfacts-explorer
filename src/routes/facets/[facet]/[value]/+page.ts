import type { FacetValueResponse } from '@openfoodfacts/openfoodfacts-nodejs';
import type { PageLoad } from './$types';
import { getFacetKnowledgePanels, getFacetValue } from '#lib/api/facets.js';
import { getBulkProductAttributes } from '#lib/api.js';
import { getTaxo } from '#lib/api/taxonomy/api.js';
import { getOrDefault } from '#lib/api/taxonomy/types.js';
import { getLocale } from '#lib/i18n/index.js';
import { getFacetDistribution, MAP_FACETS, queryValuesToDistribution } from './map-facets';

export const load: PageLoad = async ({ fetch, params, data }) => {
	const { facet, value } = params;
	const { searchOptions, queryProducts, mapValues } = data;
	const lang = getLocale().split('-')[0]?.toLowerCase() || 'en';
	const mapFacet = Object.hasOwn(MAP_FACETS, facet) ? MAP_FACETS[facet] : undefined;

	// Geographic taxonomy supplies localized names for the facet and map.
	const taxonomy = (async () => {
		if (!mapFacet) return undefined;
		try {
			return await getTaxo(facet, fetch);
		} catch (error) {
			console.error('Taxonomy fetch failed:', error);
			return undefined;
		}
	})();

	// Use Query products when configured, or fall back to Product Opener.
	const results = (async (): Promise<FacetValueResponse> => {
		try {
			return queryProducts ?? (await getFacetValue(fetch, facet, value, searchOptions));
		} catch (error) {
			console.error('Product fetch failed:', error);
			return { products: [], count: 0, page: 1, page_count: 0, page_size: searchOptions.pageSize };
		}
	})();

	// Knowledge panels are independent of the product list.
	const knowledgePanels = (async () => {
		try {
			return (await getFacetKnowledgePanels(fetch, facet, value)).knowledge_panels || {};
		} catch (error) {
			console.error('Knowledge panel fetch failed:', error);
			return {};
		}
	})();

	// Attributes support personalized scoring and depend on the product codes.
	const productAttributes = (async () => {
		const { products } = await results;
		if (products.length === 0) return {};
		try {
			return await getBulkProductAttributes(
				fetch,
				products.map((product) => product.code)
			);
		} catch (error) {
			console.error('Product attribute fetch failed:', error);
			return {};
		}
	})();

	// Query provides full-result map counts; the fallback uses current-page products.
	const distributionData = (async () => {
		const taxo = await taxonomy;
		if (mapValues) return queryValuesToDistribution(mapValues, taxo, lang);
		if (!mapFacet) return null;
		return getFacetDistribution((await results).products, mapFacet.tagsField, taxo, lang);
	})();

	return Promise.all([
		taxonomy,
		results,
		knowledgePanels,
		productAttributes,
		distributionData
	]).then(([taxo, products, panels, attributes, distribution]) => ({
		searchOptions,
		facet: { name: facet, value: getOrDefault(taxo?.[value]?.name ?? {}, lang) ?? value },
		results: products,
		knowledgePanels: panels,
		productAttributes: attributes,
		distributionData: distribution,
		mapIsPageLimited: !mapValues,
		mapFacet: mapFacet ?? null
	}));
};
