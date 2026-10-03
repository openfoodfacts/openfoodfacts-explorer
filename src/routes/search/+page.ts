import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { compatSearch, type SearchResult } from '$lib/api/search';
import { createPricesApi, isConfigured as isPricesConfigured } from '$lib/api/prices';
import {
	createProductsApi,
	getBulkProductAttributes,
	getBulkProductCardsByCode
} from '$lib/api/product';

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

	const { data: searchData, error: searchError } = await compatSearch(fetch, {
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

	if (productCodes.length === 0) {
		const off = createProductsApi(fetch);
		const attributeGroupsResponse = await off.getAttributeGroups();

		return {
			query,
			search: searchDataTyped,
			attributesByCode: {},
			prices: {},
			productCardsByCode: {},
			attributeGroups: attributeGroupsResponse.data ?? []
		};
	}

	const off = createProductsApi(fetch);

	// Create promises
	const attributesPromise = getBulkProductAttributes(fetch, productCodes);
	const productCardsPromise = getBulkProductCardsByCode(fetch, productCodes);

	const pricesPromise = isPricesConfigured()
		? getPrices(fetch, productCodes)
		: Promise.resolve({} as Record<string, number>);

	const attributeGroupsPromise = off.getAttributeGroups();

	// Load data in parallel
	const [attributesByCode, prices, productCardsByCode, attributeGroupsResponse] = await Promise.all(
		[attributesPromise, pricesPromise, productCardsPromise, attributeGroupsPromise]
	);

	const attributeGroups = attributeGroupsResponse.data ?? [];

	return {
		query,
		search: searchDataTyped,
		attributesByCode,
		prices,
		productCardsByCode,
		attributeGroups
	};
};
