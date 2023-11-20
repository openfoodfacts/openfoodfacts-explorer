import {
	getProductReducedForCard,
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

async function productsWithQuestions(
	fetch: typeof window.fetch
): Promise<ProductState<ProductReduced>[]> {
	const res: QuestionsResponse = await fetch(
		'https://robotoff.openfoodfacts.org/api/v1/questions?count=10'
	).then((it) => it.json());

	const productsPromises = res.questions.map((question) =>
		getProductReducedForCard(question.barcode, fetch)
	);

	return Promise.all(productsPromises);
}

export const load = (async ({ fetch }) => {
	const products = productsWithQuestions(fetch);

	// filtering out failures
	const filteredProducts = products.then((it) =>
		it.filter((state) => state.status != 'failure')
	) as Promise<ProductStateFound<ProductReduced>[]>;

	// deduping
	const dedupedProducts = filteredProducts.then((it) => {
		const seen = new Set<string>();
		return it.filter((state) => {
			if (seen.has(state.product.code)) return false;
			else {
				seen.add(state.product.code);
				return true;
			}
		});
	});

	return {
		streamed: { products: dedupedProducts }
	};
}) satisfies PageLoad;
