import {
	ProductsApi,
	type ProductReduced,
	type ProductState,
	type ProductStateFound
} from '$lib/api';
import type { PageLoad } from './$types';

type QuestionsResponse = {
	status: string;
	questions: {
		barcode: string;
	}[];
	count: number;
};

const count = '10';

async function productsWithQuestions(
	fetch: typeof window.fetch
): Promise<ProductState<ProductReduced>[]> {
	const response: QuestionsResponse = await fetch(
		'https://robotoff.openfoodfacts.org/api/v1/questions?' + new URLSearchParams({ count })
	).then((it) => it.json());

	const productApi = new ProductsApi(fetch);

	const productsPromises = response.questions.map((question) =>
		productApi.getProductReducedForCard(question.barcode)
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
