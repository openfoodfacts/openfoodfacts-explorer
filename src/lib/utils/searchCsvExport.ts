import type { SearchBody } from '@openfoodfacts/openfoodfacts-nodejs';

import { createSearchApi, type SearchResult } from '$lib/api/search';
import { downloadCsv, toCsv } from '$lib/utils/csv';

/** Hard cap so large queries stay responsive and don't hammer the search API. */
export const SEARCH_CSV_EXPORT_LIMIT = 500;

const EXPORT_PAGE_SIZE = 100;

const EXPORT_FIELDS = [
	'code',
	'product_name',
	'brands',
	'quantity',
	'nutriscore_grade',
	'environmental_score_grade',
	'nova_group',
	'nutriments'
] as const;

export const SEARCH_CSV_HEADERS = [
	'barcode',
	'product_name',
	'brands',
	'quantity',
	'nutriscore_grade',
	'environmental_score_grade',
	'nova_group',
	'energy_kcal_100g',
	'fat_100g',
	'saturated_fat_100g',
	'carbohydrates_100g',
	'sugars_100g',
	'fiber_100g',
	'proteins_100g',
	'salt_100g'
] as const;

export type SearchCsvProduct = {
	code?: string | null;
	product_name?: string | null;
	brands?: string | null;
	quantity?: string | null;
	nutriscore_grade?: string | null;
	environmental_score_grade?: string | null;
	ecoscore_grade?: string | null;
	nova_group?: number | string | null;
	nutriments?: Record<string, unknown> | null;
};

function nutrimentValue(
	nutriments: SearchCsvProduct['nutriments'],
	...keys: string[]
): string | number {
	if (!nutriments) return '';
	for (const key of keys) {
		const value = nutriments[key];
		if (typeof value === 'number' || typeof value === 'string') return value;
	}
	return '';
}

export function productToCsvRow(product: SearchCsvProduct): unknown[] {
	const nutriments = product.nutriments;
	return [
		product.code ?? '',
		product.product_name ?? '',
		product.brands ?? '',
		product.quantity ?? '',
		product.nutriscore_grade ?? '',
		product.environmental_score_grade ?? product.ecoscore_grade ?? '',
		product.nova_group ?? '',
		nutrimentValue(nutriments, 'energy-kcal_100g'),
		nutrimentValue(nutriments, 'fat_100g'),
		nutrimentValue(nutriments, 'saturated-fat_100g'),
		nutrimentValue(nutriments, 'carbohydrates_100g'),
		nutrimentValue(nutriments, 'sugars_100g'),
		nutrimentValue(nutriments, 'fiber_100g', 'fibers_100g'),
		nutrimentValue(nutriments, 'proteins_100g'),
		nutrimentValue(nutriments, 'salt_100g')
	];
}

export function productsToCsv(products: SearchCsvProduct[]): string {
	return toCsv([...SEARCH_CSV_HEADERS], products.map(productToCsvRow));
}

export type SearchCsvExportResult = {
	exportedCount: number;
	totalCount: number;
	truncated: boolean;
};

/**
 * Fetches search hits for the current query (no facets/charts) up to SEARCH_CSV_EXPORT_LIMIT,
 * then downloads a CSV. Uses the same `q` / `sort_by` as the results page so filters are respected.
 */
export async function exportSearchResultsCsv(options: {
	q: string;
	sortBy: string;
	fetch?: typeof globalThis.fetch;
}): Promise<SearchCsvExportResult> {
	const api = createSearchApi(options.fetch ?? fetch);
	const hits: SearchCsvProduct[] = [];
	let totalCount = 0;
	let page = 1;
	let pageCount = 1;

	while (hits.length < SEARCH_CSV_EXPORT_LIMIT && page <= pageCount) {
		const remaining = SEARCH_CSV_EXPORT_LIMIT - hits.length;
		const pageSize = Math.min(EXPORT_PAGE_SIZE, remaining);

		const body: SearchBody = {
			q: options.q,
			langs: ['en'],
			page,
			page_size: pageSize,
			sort_by: options.sortBy,
			fields: [...EXPORT_FIELDS]
		};

		const { data, error } = await api.search(body);
		if (error || data == null) {
			throw error ?? new Error('Failed to fetch search results for export');
		}

		const result = data as SearchResult;
		totalCount = result.count ?? 0;
		pageCount = result.page_count ?? page;
		hits.push(...(result.hits ?? []));

		if (!result.hits?.length) break;
		page += 1;
	}

	const truncated = totalCount > hits.length;
	const stamp = new Date().toISOString().slice(0, 10);
	downloadCsv(`off-search-${stamp}.csv`, productsToCsv(hits));

	return {
		exportedCount: hits.length,
		totalCount,
		truncated
	};
}
