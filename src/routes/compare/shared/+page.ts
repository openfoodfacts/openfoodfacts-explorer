import { getProductReducedForCard } from '$lib/api/product';
import type { ProductReduced } from '$lib/api/product';
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

	// Fetch all products in parallel
	const productPromises = barcodes.map(async (barcode) => {
		try {
			const { data, error } = await getProductReducedForCard(fetch, barcode.trim());
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
			// @ts-expect-error - TODO: fix typing issue
			return data.product as ProductReduced;
		} catch (error) {
			console.error(`Failed to fetch product ${barcode}:`, error);
			return null;
		}
	});

	const products = (await Promise.all(productPromises)).filter(
		(p): p is ProductReduced => p !== null
	);

	return {
		products,
		title
	};
};
