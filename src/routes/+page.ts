import { Robotoff } from '@openfoodfacts/openfoodfacts-nodejs';
import type { PageLoad } from './$types';

import {
	ProductsApi,
	type ProductReduced,
	type ProductState,
	type ProductStateFound
} from '$lib/api';

const INSIGHT_COUNT = 10;

async function productsWithQuestions(
	fetch: typeof window.fetch
): Promise<ProductState<ProductReduced>[]> {
	const roffApi = new Robotoff(fetch);
	const response = await roffApi.insights({ count: INSIGHT_COUNT });

	const productApi = new ProductsApi(fetch);

	const insights = response?.insights ?? [];

	const productsPromises = insights.map((question) =>
		productApi.getProductReducedForCard(question.barcode.toString())
	);
	return Promise.all(productsPromises);
}

function deduplicate<T>(array: T[], key: (el: T) => string): T[] {
	const seen = new Set<string>();
	return array.filter((el) => {
		if (seen.has(key(el))) return false;
		seen.add(key(el));
		return true;
	});
}

export const load: PageLoad = async ({ fetch }) => {
	const fetchProducts = async () => {
		const states = await productsWithQuestions(fetch);
		// filter out products that failed to load
		const products = states.filter(
			(state): state is ProductStateFound<ProductReduced> => state.status !== 'failure'
		);

		// remove duplicate products
		return deduplicate(products, (it) => it.product.code);
	};

	const products = fetchProducts();

	return {
		streamed: { products }
	};
};
