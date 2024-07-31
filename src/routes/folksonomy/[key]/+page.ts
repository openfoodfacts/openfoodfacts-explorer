import { ProductsApi } from '$lib/api';
import { FolksonomyApi } from '$lib/api/folksonomy';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const { key } = params;
	const tags = (await new FolksonomyApi(fetch).getProducts(key)) ?? [];

	const productsApi = new ProductsApi(fetch);
	const products = Promise.all(tags.map((tag) => productsApi.getProductName(tag.product)));

	return {
		tags,
		streamed: { products }
	};
};
