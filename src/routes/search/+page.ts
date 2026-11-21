import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

import { compatSearch, type SearchResult } from '#lib/api/search.js';
import { resolveForUrl } from '#lib/paths.js';
import { parseUrlLocation } from '#lib/url-location.js';
import { createPricesApi, isConfigured as isPricesConfigured } from '#lib/api/prices.js';
import { createProductsApi } from '#lib/api/product.js';
import {
	getBulkProductCardsAndAttributes,
	MAX_PRODUCTS_PER_REQUEST
} from '#lib/api/bulk-product-details.js';
import { Gs1Barcode } from '#lib/barcodes/gs1.js';
import { getLanguageCode, preferences } from '#lib/settings.js';

function getBarcodeRedirectTarget(query: string): string | null {
	const trimmed = query.trim();
	const parsed = Gs1Barcode.parse(trimmed);
	if (parsed?.code) return parsed.code;
	if (/^\d{5,7}$/.test(trimmed)) return trimmed;
	return null;
}

/** Returns the number of prices for each barcode, using one Prices API request per 100 codes. */
async function getPrices(
	baseFetch: typeof fetch,
	barcodes: string[]
): Promise<Record<string, number>> {
	const prices: Record<string, number> = {};
	const api = createPricesApi(baseFetch);

	const batches: string[][] = [];
	for (let i = 0; i < barcodes.length; i += 100) {
		batches.push(barcodes.slice(i, i + 100));
	}

	const results = await Promise.all(
		batches.map(async (codes) => {
			try {
				const query = { code__in: codes.join(','), size: codes.length } as Parameters<
					typeof api.getProducts
				>[0];
				const res = await api.getProducts(query);
				return { codes, items: res.data?.items.flat() ?? null };
			} catch {
				return { codes, items: null };
			}
		})
	);

	for (const { codes, items } of results) {
		if (!items) continue;
		for (const code of codes) prices[code] = 0;
		for (const item of items) prices[item.code] = item.price_count ?? 0;
	}

	return prices;
}

export const load: PageLoad = async ({ fetch, url }) => {
	const query = url.searchParams.get('q');
	const sortBy = url.searchParams.get('sort_by') || '-unique_scans_n';

	if (query == null || query.length === 0) {
		error(400, 'Missing query parameter');
	}

	// If the query is a recognized barcode or store code, redirect directly to the product
	const barcode = getBarcodeRedirectTarget(query);
	if (barcode) {
		redirect(308, resolveForUrl(url, '/products/[barcode]', { barcode }));
	}

	const page = parseInt(url.searchParams.get('page') || '1', 10);
	// Product details are fetched in one request, so do not ask for more results than it can return
	const requestedPageSize = parseInt(url.searchParams.get('page_size') || '24', 10);
	const pageSize = Math.min(requestedPageSize, MAX_PRODUCTS_PER_REQUEST);
	const lang =
		parseUrlLocation(url.pathname)?.language ?? getLanguageCode(get(preferences).locale) ?? 'en';

	const { data: searchData, error: searchError } = await compatSearch(fetch, {
		q: query,
		langs: [lang],
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
	const productDetailsPromise = getBulkProductCardsAndAttributes(fetch, productCodes).catch(
		(error): Awaited<ReturnType<typeof getBulkProductCardsAndAttributes>> => {
			console.error('Product cards and attributes fetch failed:', error);
			return { cardsByCode: {}, attributesByCode: {} };
		}
	);

	const pricesPromise = isPricesConfigured()
		? getPrices(fetch, productCodes)
		: Promise.resolve({} as Record<string, number>);

	const attributeGroupsPromise = off.getAttributeGroups();

	// Load data in parallel
	const [productDetails, prices, attributeGroupsResponse] = await Promise.all([
		productDetailsPromise,
		pricesPromise,
		attributeGroupsPromise
	]);
	const productCardsByCode = productDetails.cardsByCode;
	const attributesByCode = productDetails.attributesByCode;

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
