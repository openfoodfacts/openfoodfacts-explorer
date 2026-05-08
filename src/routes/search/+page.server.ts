import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { PricesApi, SearchApi, type SearchBody } from '@openfoodfacts/openfoodfacts-nodejs';

import { createSearchApi, type SearchResult } from '$lib/api/search';
import { createPricesApi, isConfigured as isPricesConfigured } from '$lib/api/prices';
import { createProductsApi, getBulkProductAttributes } from '$lib/api/product';

function isValidEAN13(code: string): boolean {
	if (!/^\d{13}$/.test(code)) {
		return false;
	}

	const digits = code.split('').map(Number);
	const checksum =
		digits.slice(0, 12).reduce((sum, digit, index) => {
			return sum + digit * (index % 2 === 0 ? 1 : 3);
		}, 0) % 10;

	const checkDigit = (10 - checksum) % 10;
	return checkDigit === digits[12];
}

async function getPrices(api: PricesApi, barcodes: string[]): Promise<Record<string, number>> {
	const prices: Record<string, number> = {};
	const results = await Promise.all(
		barcodes.map(async (code) => ({
			code: code,
			prices: await api.getPrices({ product_code: code })
		}))
	);

	for (const result of results) {
		if (result.prices.data && result.prices.data.items) {
			prices[result.code] = result.prices.data.total;
		}
	}

	return prices;
}

// FIXME: We can drop this compatibility layer once the new API is deployed in production
async function compatSearch(
	api: SearchApi,
	params: Omit<SearchBody, 'facets' | 'charts'>
): ReturnType<SearchApi['search']> {
	// Try the new API first
	const newParams: SearchBody = {
		...params,
		facets: ['brands', 'categories', 'nutrition_grades', 'ecoscore_grade'],
		charts: [
			{ chart_type: 'DistributionChart', field: 'nutrition_grades' },
			{ chart_type: 'DistributionChart', field: 'ecoscore_grade' },
			{ chart_type: 'DistributionChart', field: 'nova_groups' },
			{ chart_type: 'ScatterChart', x: 'nutriscore_score', y: 'nutriments.fiber_100g' }
		]
	};

	try {
		const { data, error } = await api.search(newParams);
		if (error || data == null) {
			throw error || new Error('No data');
		}
		// @ts-expect-error - data is unknown
		return { data };
	} catch {
		console.warn('search: new API failed, falling back to old API');
	}

	const oldParams = {
		...params,
		facets: ['nutrition_grades', 'ecoscore_grade'],
		charts: [
			{ chart_type: 'DistributionChartType', field: 'nutrition_grades' },
			{ chart_type: 'DistributionChartType', field: 'ecoscore_grade' },
			{ chart_type: 'DistributionChartType', field: 'nova_groups' },
			{ chart_type: 'ScatterChartType', x: 'nutriscore_score', y: 'nutriments.fiber_100g' }
		]
	};

	// @ts-expect-error - SDK only accepts the new params
	return api.search(oldParams);
}

export const load: PageServerLoad = async ({ fetch, url }) => {
	const query = url.searchParams.get('q');
	const sortBy = url.searchParams.get('sort_by') || '-unique_scans_n';

	if (query == null || query.length === 0) {
		error(400, 'Missing query parameter');
	}

	// If the code is an EAN13 code, we can directly fetch the product
	if (isValidEAN13(query)) {
		redirect(308, `/products/${query}`);
	}

	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const pageSize = parseInt(url.searchParams.get('page_size') || '24', 10);

	const api = createSearchApi(fetch);

	const { data: searchData, error: searchError } = await compatSearch(api, {
		q: query,
		langs: ['en'],
		page,
		page_size: pageSize,
		sort_by: sortBy
	});

	if (searchError || !searchData) {
		console.error('Search API error:', searchError);
		error(500, 'Failed to fetch search results');
	}

	const searchDataTyped = searchData as SearchResult;

	// Prepare data
	const productCodes = searchDataTyped.hits.map((hit) => hit.code);
	const off = createProductsApi(fetch);

	// Create promises
	const attributesPromise = getBulkProductAttributes(fetch, productCodes);

	const pricesPromise = isPricesConfigured()
		? getPrices(createPricesApi(fetch), productCodes)
		: Promise.resolve({} as Record<string, number>);

	const attributeGroupsPromise = off.getAttributeGroups();

	// Load data in parallel
	const [attributesByCode, prices, attributeGroupsResponse] = await Promise.all([
		attributesPromise,
		pricesPromise,
		attributeGroupsPromise
	]);

	const attributeGroups = attributeGroupsResponse.data ?? [];

	return {
		query,
		search: searchDataTyped,
		attributesByCode,
		prices,
		attributeGroups
	};
};
