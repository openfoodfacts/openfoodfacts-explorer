import {
	ProductsApi,
	type ProductReduced,
	type ProductState,
	type ProductStateFound
} from '$lib/api';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

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
		const isNetworkError =
			err instanceof TypeError &&
			(err.message === 'fetch failed' ||
				err.message.includes('ENOTFOUND') ||
				err.message.includes('Failed to fetch') ||
				err.message.includes('NetworkError') ||
				err.name === 'AbortError' ||
				err.message.includes('timeout'));
		if (isNetworkError) {
			throw error(503, {
				message: 'network_error',
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
			throw error(500, {
				message: 'unexpected_error',
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
