import { ProductsApi } from '$lib/api';
import { createFolksonomyApi } from '$lib/api/folksonomy';
import type { PageLoad } from './$types';
import type { FolksonomyTag } from '$lib/api/folksonomy';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const { key } = params;
	const folksonomyApi = createFolksonomyApi(fetch);
	const tags = ((await folksonomyApi.getProducts(key)) as FolksonomyTag[]) ?? [];

	const productsApi = new ProductsApi(fetch);
	const products = Promise.all(tags.map((tag) => productsApi.getProductName(tag.product)));

	return {
		tags,
		streamed: { products }
	};
};
