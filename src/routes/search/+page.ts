import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { PricesApi, type SearchBody } from '@openfoodfacts/openfoodfacts-nodejs';
import { createSearchApi, type SearchResult } from '$lib/api/search';
import { createPricesApi, isConfigured as isPricesConfigured } from '$lib/api/prices';
import { createProductsApi, getBulkProductAttributes } from '$lib/api/product';

export const ssr = false;

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

export const load: PageLoad = async ({ fetch, url }) => {
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

	const params: SearchBody = {
		q: query,
		langs: ['en'],
		page: page,
		page_size: pageSize,
		facets: ['brands', 'categories', 'nutrition_grades', 'ecoscore_grade'],
		charts: [
			{ chart_type: 'DistributionChart', field: 'nutrition_grades' },
			{ chart_type: 'DistributionChart', field: 'ecoscore_grade' },
			{ chart_type: 'DistributionChart', field: 'nova_groups' },
			{ chart_type: 'ScatterChart', x: 'nutriscore_score', y: 'nutriments.fiber_100g' }
		],
		sort_by: sortBy
	};

	const { data: searchData, error: searchError } = await api.search(params);
	if (searchError || !searchData) {
		console.error('Search API error:', searchError);
		error(500, 'Failed to fetch search results');
	}

	const searchDataTyped = searchData as SearchResult;

	// Get attributes for all products using the API
	const productCodes = searchDataTyped.hits.map((hit) => hit.code);
	const attributesByCode = await getBulkProductAttributes(fetch, productCodes);

	let prices: Record<string, number> = {};
	if (isPricesConfigured()) {
		const pricesApi = createPricesApi(fetch);
		prices = await getPrices(pricesApi, productCodes);
	}

	const off = createProductsApi(fetch);
	const { data: attributeGroups } = await off.getAttributeGroups();

	return {
		query,
		search: searchDataTyped,
		attributesByCode,
		prices: prices,
		attributeGroups: attributeGroups ?? []
	};
};
