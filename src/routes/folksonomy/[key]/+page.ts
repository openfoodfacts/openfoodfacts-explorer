import { getProductName, getProducts } from '$lib/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const { key } = params;

	const tags = await getProducts(fetch, key);

	const products = Promise.all(tags.map((tag) => getProductName(fetch, tag.product)));

	return {
		tags,
		streamed: {
			products
		}
	};
};
