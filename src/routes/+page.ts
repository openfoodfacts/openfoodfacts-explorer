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
		'https://robotoff.openfoodfacts.org/api/v1/questions?' + new URLSearchParams({ count: count })
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
		else {
			seen.add(key(el));
			return true;
		}
	});
}

export const load: PageLoad = async ({ fetch }) => {
	const states = productsWithQuestions(fetch);

	// filtering out failures
	const filteredProducts: ProductStateFound<ProductReduced>[] = await states.then((states) =>
		states.filter(
			(state): state is ProductStateFound<ProductReduced> => state.status != 'failure'
		)
	);

	// deduping
	const dedupedProducts = deduplicate(await filteredProducts, (it) => it.product.code);

	return {
		streamed: { products: dedupedProducts }
	};
};
