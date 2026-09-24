import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { SearchApi, type SearchBody } from '@openfoodfacts/openfoodfacts-nodejs';

import { createSearchApi, type SearchResult } from '$lib/api/search';
import { createPricesApi, isConfigured as isPricesConfigured } from '$lib/api/prices';
import { createProductsApi, getBulkProductAttributes } from '$lib/api/product';

const MOCK_FACET_FALLBACKS = {
	categories: {
		name: 'categories',
		count_error_margin: 0,
		items: [
			{
				key: 'en:beverages',
				name: 'Beverages',
				count: 4200,
				selected: false,
				icon_url: 'https://static.openfoodfacts.org/images/icons/dist/beverages.svg'
			},
			{
				key: 'en:snacks',
				name: 'Snacks',
				count: 3100,
				selected: false,
				icon_url: 'https://static.openfoodfacts.org/images/icons/dist/snacks.svg'
			},
			{
				key: 'en:dairies',
				name: 'Dairies',
				count: 2500,
				selected: false,
				icon_url: 'https://static.openfoodfacts.org/images/icons/dist/dairies.svg'
			}
		]
	},
	labels: {
		name: 'labels',
		count_error_margin: 0,
		items: [
			{
				key: 'en:organic',
				name: 'Organic',
				count: 8500,
				selected: false,
				icon_url: 'https://static.openfoodfacts.org/images/icons/dist/organic.svg'
			},
			{
				key: 'en:fair-trade',
				name: 'Fair Trade',
				count: 1900,
				selected: false,
				icon_url: 'https://static.openfoodfacts.org/images/icons/dist/fair-trade.svg'
			},
			{
				key: 'en:vegan',
				name: 'Vegan',
				count: 5400,
				selected: false,
				icon_url: 'https://static.openfoodfacts.org/images/icons/dist/vegan.svg'
			},
			{
				key: 'en:gluten-free',
				name: 'Gluten-Free',
				count: 3200,
				selected: false,
				icon_url: 'https://static.openfoodfacts.org/images/icons/dist/gluten-free.svg'
			}
		]
	}
};

function emptySearchResult(page: number, pageSize: number): SearchResult {
	return {
		aggregations: null,
		charts: {},
		count: 0,
		debug: {},
		facets: MOCK_FACET_FALLBACKS,
		hits: [],
		is_count_exact: true,
		page,
		page_count: 0,
		page_size: pageSize,
		timed_out: false,
		took: 0,
		warnings: []
	};
}

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

async function getPrices(
	baseFetch: typeof fetch,
	barcodes: string[]
): Promise<Record<string, number>> {
	const prices: Record<string, number> = {};
	const api = createPricesApi(baseFetch);
	const results = await Promise.all(
		barcodes.map(async (code) => {
			try {
				const res = await api.getPrices({ product_code: code });
				return { code, prices: res };
			} catch {
				return { code, prices: { data: null } };
			}
		})
	);

	for (const result of results) {
		if (result.prices && result.prices.data && result.prices.data.items) {
			prices[result.code] = result.prices.data.total;
		}
	}

	return prices;
}

// FIXME: We can drop this compatibility layer once the new API is deployed in production
async function compatSearch(
	baseFetch: typeof fetch,
	params: Omit<SearchBody, 'facets' | 'charts'>
): ReturnType<SearchApi['search']> {
	const api = createSearchApi(baseFetch);

	// Try the new API first
	const newParams: SearchBody = {
		...params,
		facets: [
			'brands',
			'categories',
			'nutrition_grades',
			'environmental_score_grade',
			'nova_group',
			'labels',
			'countries',
			'allergens',
			'additives',
			'stores',
			'languages'
		],
		charts: [
			{ chart_type: 'DistributionChartType', field: 'nutrition_grades' },
			{ chart_type: 'DistributionChartType', field: 'environmental_score_grade' },
			{ chart_type: 'DistributionChartType', field: 'nova_group' },
			{ chart_type: 'ScatterChartType', x: 'nutriscore_score', y: 'nutriments.fiber_100g' }
		] as unknown as SearchBody['charts']
	};

	try {
		const res = await api.search(newParams);

		if (res.error || res.data == null) {
			console.error('Search API newParams error:', res.error);
			throw res.error || new Error('No data');
		}
		// @ts-expect-error - data is unknown
		return { data: res.data };
	} catch (e) {
		console.warn('search: API failed, falling back to basic facets:', e);
	}

	const oldParams = {
		...params,
		facets: ['brands', 'categories', 'nutrition_grades', 'environmental_score_grade'],
		charts: [
			{ chart_type: 'DistributionChartType', field: 'nutrition_grades' },
			{ chart_type: 'DistributionChartType', field: 'environmental_score_grade' },
			{ chart_type: 'DistributionChartType', field: 'nova_group' },
			{ chart_type: 'ScatterChartType', x: 'nutriscore_score', y: 'nutriments.fiber_100g' }
		]
	};

	try {
		// @ts-expect-error - legacy search API parameters fallback
		return await api.search(oldParams);
	} catch (cause) {
		console.error('Search API legacy fallback failed', cause);
		return { error: cause } as Awaited<ReturnType<SearchApi['search']>>;
	}
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

	let searchResponse: Awaited<ReturnType<SearchApi['search']>>;
	try {
		searchResponse = await compatSearch(fetch, {
			q: query,
			langs: ['en'],
			page,
			page_size: pageSize,
			sort_by: sortBy
		});
	} catch (cause) {
		console.error('Search API request failed', cause);
		return {
			query,
			search: emptySearchResult(page, pageSize),
			attributesByCode: {},
			prices: {},
			attributeGroups: [],
			searchUnavailable: true
		};
	}

	const { data: searchData, error: searchError } = searchResponse;

	if (searchError || !searchData) {
		console.error('Search API error:', searchError);
		return {
			query,
			search: emptySearchResult(page, pageSize),
			attributesByCode: {},
			prices: {},
			attributeGroups: [],
			searchUnavailable: true
		};
	}

	const searchDataTyped = searchData as SearchResult;

	// Prepare data
	const productCodes = searchDataTyped.hits.map((hit) => hit.code);

	if (productCodes.length === 0) {
		return {
			query,
			search: searchDataTyped,
			attributesByCode: {},
			prices: {},
			attributeGroups: [],
			searchUnavailable: false
		};
	}

	const off = createProductsApi(fetch);

	// Create promises
	const attributesPromise = getBulkProductAttributes(fetch, productCodes);

	const pricesPromise = isPricesConfigured()
		? getPrices(fetch, productCodes)
		: Promise.resolve({} as Record<string, number>);

	const attributeGroupsPromise = off.getAttributeGroups();

	// Load data in parallel
	try {
		const [attributesByCode, prices, attributeGroupsResponse] = await Promise.all([
			attributesPromise,
			pricesPromise,
			attributeGroupsPromise
		]);

		return {
			query,
			search: searchDataTyped,
			attributesByCode,
			prices,
			attributeGroups: attributeGroupsResponse.data ?? [],
			searchUnavailable: false
		};
	} catch (cause) {
		console.error('Could not load search result details', cause);
		return {
			query,
			search: searchDataTyped,
			attributesByCode: {},
			prices: {},
			attributeGroups: [],
			searchUnavailable: false
		};
	}
};
