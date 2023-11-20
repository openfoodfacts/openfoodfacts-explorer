import { getProductReducedForCard, type ProductReduced, type ProductStateFound } from '$lib/api';
import type { PageLoad } from './$types';

async function productsWithQuestions(fetch: typeof window.fetch) {
	const res = await fetch('https://robotoff.openfoodfacts.org/api/v1/questions?count=10');
	const questions = (await res.json()) as {
		status: string;
		questions: {
			barcode: string;
		}[];
		count: number;
	};

	const products = await Promise.all(
		questions.questions.map((question) => getProductReducedForCard(question.barcode, fetch))
	);
	return products;
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
