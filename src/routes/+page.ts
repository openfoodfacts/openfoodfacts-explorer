import { getProductReducedForCard } from '$lib/api';
import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	const res = await fetch('https://robotoff.openfoodfacts.org/api/v1/questions?count=10');
	const questions = (await res.json()) as {
		status: 'no_questions';
		questions: {
			barcode: string;
		}[];
		count: 0;
	};

	const products = questions.questions.map(
		async (question) => await getProductReducedForCard(question.barcode, fetch)
	);

	return {
		questions,
		streamed: { products }
	};
}) satisfies PageLoad;
