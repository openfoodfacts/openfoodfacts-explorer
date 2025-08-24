import { createProductsApi } from '$lib/api';
import { createFolksonomyApi } from '$lib/api/folksonomy';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	const { key } = params;

	const folksonomyApi = createFolksonomyApi(fetch);
	const productsApi = createProductsApi(fetch);

	const { data: tags, error } = (await folksonomyApi.getProducts(key)) ?? [];
	if (!tags) throw new Error('Error loading folksonomy data: ' + error);

	const products = await Promise.all(
		tags.map(async (tag) => {
			const { data: state, error } = await productsApi.getProductV3(tag.product, {
				fields: ['product_name']
			});

			if (error != null || state == null || state.status == 'failure') return null;
			return state.product;
		})
	);

	return {
		tags,
		products
	};
};
