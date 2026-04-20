import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { PricesApi, SearchApi, type SearchBody } from '@openfoodfacts/openfoodfacts-nodejs';

import { createSearchApi, type SearchResult } from '$lib/api/search';
import { createPricesApi, isConfigured as isPricesConfigured } from '$lib/api/prices';
import { createProductsApi, getBulkProductAttributes } from '$lib/api/product';
import { withConcurrencyLimit } from '$lib/utils/promises';

// Maximum number of Prices API requests allowed to run in parallel.
// A full page of search results can contain ~24 products, and firing every
// price lookup simultaneously risks rate-limiting and slows the page down.
// 5 is a conservative value that balances throughput with backend safety.
const PRICES_CONCURRENCY_LIMIT = 5;

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
	if (barcodes.length === 0) return {};

	// Each task preserves its barcode on failure so rejected results can be
	// logged against the specific product that failed.
	const tasks = barcodes.map((code) => async () => {
		try {
			const pricesResponse = await api.getPrices({ product_code: code });
			return { code, pricesResponse };
		} catch (err) {
			throw { code, error: err };
		}
	});

	const settled = await withConcurrencyLimit(tasks, PRICES_CONCURRENCY_LIMIT);

	const prices: Record<string, number> = {};
	for (const result of settled) {
		if (result.status === 'rejected') {
			const { code, error: fetchError } = (result.reason ?? {}) as {
				code?: string;
				error?: unknown;
			};
			if (code) {
				console.warn(`[getPrices] Failed to fetch price for barcode ${code}:`, fetchError);
				// Guarantee every attempted barcode has a numeric entry so the UI
				// never renders "undefined prices" when a single lookup fails.
				prices[code] = 0;
			} else {
				console.warn('[getPrices] Failed to fetch price for a barcode:', result.reason);
			}
			continue;
		}

		const { code, pricesResponse } = result.value;

		// Store the total whenever the API returned a numeric value (including 0).
		// Products with zero recorded prices are still valid data and must appear
		// in the map, otherwise the UI renders "undefined prices" in the badge.
		prices[code] =
			pricesResponse.data != null && typeof pricesResponse.data.total === 'number'
				? pricesResponse.data.total
				: 0;
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
