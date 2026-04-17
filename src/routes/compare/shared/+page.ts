import OpenFoodFacts, { type Product } from '@openfoodfacts/openfoodfacts-nodejs';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

const MAX_SHARED_COMPARE_BARCODES = 10;
const MAX_PARALLEL_PRODUCT_FETCHES = 4;

async function mapWithConcurrency<T, R>(
	items: T[],
	concurrency: number,
	mapper: (item: T) => Promise<R>
): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let nextIndex = 0;

	const worker = async () => {
		while (nextIndex < items.length) {
			const currentIndex = nextIndex;
			nextIndex += 1;
			results[currentIndex] = await mapper(items[currentIndex]);
		}
	};

	await Promise.all(
		Array.from({ length: Math.min(concurrency, items.length) }, async () => worker())
	);

	return results;
}

export const load: PageLoad = async ({ url, fetch }) => {
	const barcodesParam = url.searchParams.get('barcodes');
	const title = url.searchParams.get('title') || '';

	if (!barcodesParam) {
		return {
			products: [],
			title
		};
	}

	const barcodes = barcodesParam
		.split(',')
		.map((barcode) => barcode.trim())
		.filter(Boolean);

	if (barcodes.length > MAX_SHARED_COMPARE_BARCODES) {
		throw error(
			400,
			`Too many barcodes in shared comparison: maximum is ${MAX_SHARED_COMPARE_BARCODES}.`
		);
	}

	const offApi = new OpenFoodFacts(fetch);

	const productsOrNull = await mapWithConcurrency(
		barcodes,
		MAX_PARALLEL_PRODUCT_FETCHES,
		async (barcode) => {
			try {
				const { data, error } = await offApi.getProductV3(barcode);
				if (error) {
					console.error(`Error fetching product ${barcode}:`, error);
					return null;
				} else if (!data) {
					console.error(`No data returned for product ${barcode}`);
					return null;
				} else if (data.status === 'failure') {
					console.error(`Product ${barcode} not found:`, data.errors);
					return null;
				}
				return data.product;
			} catch (error) {
				console.error(`Failed to fetch product ${barcode}:`, error);
				return null;
			}
		}
	);

	// @ts-expect-error - Product should not have { [key: string]: string }, because
	// that means it ONLY has string values
	const products: Product[] = productsOrNull.filter((p) => p !== null);

	return {
		products,
		title
	};
};
