import { getProductReducedForCard } from '$lib/api';
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
	return {
		streamed: { products: productsWithQuestions(fetch) }
	};
}) satisfies PageLoad;
