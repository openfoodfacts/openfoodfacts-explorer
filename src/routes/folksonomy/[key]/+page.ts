import { getBulkProducts } from '$lib/api/product';
import { createFolksonomyApi } from '$lib/api/folksonomy';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const { key } = params;

	const folksonomyApi = createFolksonomyApi(fetch);

	const { data: tags, error } = (await folksonomyApi.getProducts(key)) ?? [];
	if (!tags) throw new Error('Error loading folksonomy data: ' + error);

	const barcodes = tags.map((tag) => tag.product);
	const bulkProducts = await getBulkProducts(fetch, barcodes, ['product_name', 'code']);

	const productsMap = new Map(bulkProducts.map((p) => [p.code, p]));
	const products = barcodes.map((code) => productsMap.get(code) ?? null);

	return {
		tags,
		products
	};
};
