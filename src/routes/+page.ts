import {
	ProductsApi,
	type ProductReduced,
	type ProductState,
	type ProductStateFound
} from '$lib/api';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { ERROR_TYPES, ERROR_CODES, isNetworkError } from '$lib/errors';

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
	try {
		const states = await productsWithQuestions(fetch);
		const products: ProductStateFound<ProductReduced>[] = states.filter(
			(state): state is ProductStateFound<ProductReduced> => state.status !== 'failure'
		);
		const dedupedProducts = deduplicate(products, (it) => it.product.code);
		return {
			streamed: { products: Promise.resolve(dedupedProducts) }
		};
	} catch (err: unknown) {
		if (isNetworkError(err)) {
			throw error(ERROR_CODES.NETWORK, {
				message: ERROR_TYPES.NETWORK_ERROR,
				errors: [
					{
						message: {
							name: (err as Error).name,
							id: (err as Error).message,
							lc_name: String(err)
						},
						impact: { name: 'fetch', id: 'network', lc_name: 'network' },
						field: { id: 'url', value: 'Open Food Facts API' }
					}
				]
			});
		} else {
			throw error(ERROR_CODES.UNEXPECTED, {
				message: ERROR_TYPES.UNEXPECTED_ERROR,
				errors: [
					{
						message: {
							name: err instanceof Error ? err.name : 'unknown',
							id: err instanceof Error ? err.message : String(err),
							lc_name: String(err)
						},
						impact: { name: 'unknown', id: 'unknown', lc_name: 'unknown' },
						field: { id: 'unknown', value: 'unknown' }
					}
				]
			});
		}
	}
};
