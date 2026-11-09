import type { FacetValueResponse } from '@openfoodfacts/openfoodfacts-nodejs';
import type { PageLoad } from './$types';
import { getFacetKnowledgePanels, getFacetValue } from '#lib/api/facets.js';
import { getBulkProductAttributesAndImages } from '#lib/api/bulk-product-details.js';
import { getTaxo } from '#lib/api/taxonomy/api.js';
import { getOrDefault } from '#lib/api/taxonomy/types.js';
import { getLocale } from '#lib/i18n/index.js';
import { getFacetDistribution, queryValuesToDistribution } from './map-facets';
import { MAP_FACETS } from '../map-facets';

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

	// Fetch scoring attributes and card images together for the product codes.
	const productDetails = (async () => {
		const { products } = await results;
		if (products.length === 0) return { attributesByCode: {}, imagesByCode: {} };
		try {
			return await getBulkProductAttributesAndImages(
				fetch,
				products.map((product) => product.code)
			);
		} catch (error) {
			console.error('Product attribute fetch failed:', error);
			return { attributesByCode: {}, imagesByCode: {} };
		}
	})();

	// Query provides full-result map counts; the fallback uses current-page products.
	const distributionData = (async () => {
		const taxo = await taxonomy;
		if (mapValues) return queryValuesToDistribution(mapValues, taxo, lang);
		if (!mapFacet) return null;
		return getFacetDistribution((await results).products, mapFacet.tagsField, taxo, lang);
	})();

	const [taxo, products, panels, details, distribution] = await Promise.all([
		taxonomy,
		results,
		knowledgePanels,
		productDetails,
		distributionData
	]);
	return {
		searchOptions,
		facet: { name: facet, value: getOrDefault(taxo?.[value]?.name ?? {}, lang) ?? value },
		results: {
			...products,
			products: products.products.map((product) => {
				const image = details.imagesByCode[product.code];
				return image ? Object.assign({}, product, { image_front_small_url: image }) : product;
			})
		},
		knowledgePanels: panels,
		productAttributes: details.attributesByCode,
		distributionData: distribution,
		mapIsPageLimited: !mapValues,
		mapFacet: mapFacet ?? null
	};
};
