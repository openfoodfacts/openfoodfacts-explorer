import {
	ProductsApi,
	type ProductReduced,
	type ProductState,
	type ProductStateFound
} from '$lib/api';
import type { PageLoad } from './$types';
import { persisted } from 'svelte-local-storage-store';
import { get } from 'svelte/store';

type QuestionsResponse = {
	status: string;
	questions: {
		barcode: string;
	}[];
	count: number;
};

type CachedData = {
	products: ProductState<ProductReduced>[];
	timestamp: number;
};

const CACHE_EXPIRY = 10 * 60 * 1000; // 10 mins in milliseconds
const count = '10';

// created persisted store for caching the products
const cachedProducts = persisted<CachedData | null>('cached-products-with-questions', null);

async function productsWithQuestions(
	fetch: typeof window.fetch
): Promise<ProductState<ProductReduced>[]> {
	// checking if we have valid cached data
	const cached = get(cachedProducts);
	if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
		return cached.products;
	}

	const response: QuestionsResponse = await fetch(
		'https://robotoff.openfoodfacts.org/api/v1/questions?' + new URLSearchParams({ count: count })
	).then((it) => it.json());

	const productApi = new ProductsApi(fetch);

	const productsPromises = response.questions.map((question) =>
		productApi.getProductReducedForCard(question.barcode)
	);

	const products = await Promise.all(productsPromises);

	// cache the results
	cachedProducts.set({
		products,
		timestamp: Date.now()
	});
	return products;
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
	const products: Promise<ProductStateFound<ProductReduced>[]> = states
		.then((states) =>
			states.filter(
				(state): state is ProductStateFound<ProductReduced> => state.status != 'failure'
			)
		)
		.then((states) => {
			return deduplicate(states, (it) => it.product.code);
		});

	return {
		streamed: { products: products }
	};
};
