import { createProductsApi } from '$lib/api';
import { createFolksonomyApi } from '$lib/api/folksonomy';
import type { PageLoad } from './$types';
import type { FolksonomyTag } from '$lib/api/folksonomy';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const { key } = params;
	const folksonomyApi = createFolksonomyApi(fetch);
	const tags = ((await folksonomyApi.getProducts(key)) as FolksonomyTag[]) ?? [];

	const productsApi = createProductsApi(fetch);

	const products = await Promise.all(
		tags.map(async (tag) => {
			const fetchedProduct = await productsApi.getProductV3(tag.product, {
				fields: ['product_name']
			});

			// @ts-expect-error - https://github.com/openfoodfacts/openfoodfacts-server/issues/12273
			if (fetchedProduct != null && fetchedProduct.status !== 'failure') {
				return fetchedProduct.product;
			} else {
				return null;
			}
		})
	);

	return {
		tags,
		products
	};
};
