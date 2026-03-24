import OpenFoodFacts, { type Product } from '@openfoodfacts/openfoodfacts-nodejs';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const barcodesParam = url.searchParams.get('barcodes');
	const title = url.searchParams.get('title') || '';

	if (!barcodesParam) {
		return {
			products: [],
			title
		};
	}

	const barcodes = barcodesParam.split(',').filter(Boolean);

	const offApi = new OpenFoodFacts(fetch);

	// Fetch all products in parallel
	const productPromises = barcodes.map(async (barcode) => {
		try {
			const { data, error } = await offApi.getProductV3(barcode.trim());
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
	});

	// @ts-expect-error - Product should not have { [key: string]: string }, because
	// that means it ONLY has string values
	const products: Product[] = (await Promise.all(productPromises)).filter((p) => p !== null);

	return {
		products,
		title
	};
};
