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

	// Extract filter parameters from URL
	const nutriscore = url.searchParams.get('nutriscore') || '';
	const ecoscore = url.searchParams.get('ecoscore') || '';
	const country = url.searchParams.get('country') || '';
	const category = url.searchParams.get('category') || '';

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

	// Append filter parameters to the search body if provided
	if (nutriscore) {
		(params as Record<string, unknown>)['nutrition_grades_tags'] = nutriscore;
	}
	if (ecoscore) {
		(params as Record<string, unknown>)['ecoscore_grade'] = ecoscore;
	}
	if (country) {
		(params as Record<string, unknown>)['countries_tags'] = `en:${country}`;
	}
	if (category) {
		(params as Record<string, unknown>)['categories_tags'] = `en:${category}`;
	}

	const { data: searchData, error: searchError } = await api.search(params);
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
