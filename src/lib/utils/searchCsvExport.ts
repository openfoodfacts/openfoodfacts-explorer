import { resolve } from '$app/paths';
import { downloadCsv, toCsv } from '$lib/utils/csv';

export const SEARCH_CSV_HEADERS = [
	'barcode',
	'product_name',
	'brands',
	'quantity',
	'categories',
	'countries',
	'product_url',
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
	categories?: string | null;
	countries?: string | null;
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
		product.categories ?? '',
		product.countries ?? '',
		product.code ? resolve('/products/[barcode]', { barcode: product.code }) : '',
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

export async function productsToCsv(products: SearchCsvProduct[]): Promise<string> {
	return toCsv([...SEARCH_CSV_HEADERS], products.map(productToCsvRow));
}

/** Downloads the products already displayed on the current search results page. */
export async function exportSearchResultsCsv(products: SearchCsvProduct[]): Promise<number> {
	const stamp = new Date().toISOString().slice(0, 10);
	downloadCsv(`off-search-${stamp}.csv`, await productsToCsv(products));
	return products.length;
}
