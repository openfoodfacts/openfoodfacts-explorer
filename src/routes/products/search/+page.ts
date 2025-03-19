import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { ProductsApi } from '$lib/api';
import type { Product, ProductState, ProductStateFound } from '$lib/api/product';

export const load: PageLoad = async ({ fetch, url }) => {
	const query = url.searchParams.get('q');

	if (query == null || query.length === 0) {
		error(400, 'Missing query parameter');
	}

	// If the code is an EAN13 code, we can directly fetch the product
	if (query.match(/^\d{13}$/)) {
		redirect(308, `/products/${query}`);
	}

	const page = url.searchParams.get('page') || '1';

	const urlSearch = new URLSearchParams({
		search_terms: query,
		search_simple: '1',
		json: '1',
		page: page
	});

	const productsApi = new ProductsApi(fetch);

	const searchResult = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?` + urlSearch.toString())
		.then((res) => {
			if (!res.ok) {
				error(400, 'Failed to fetch data');
			}
			return res;
		})
		.then(
			(res) =>
				res.json() as Promise<{
					count: number;
					page: number;
					page_size: number;
					page_count: number;
					products: Product[];
				}>
		
		);

	// Load full product details for each search result
	const productsWithDetails = await Promise.all(
		searchResult.products.map(async (product) => {
			try {
				const state = await productsApi.getProduct(product.code);
				return state;
			} catch (e) {
				console.error('Failed to load product details:', e);
				return null;
			}
		})
	);

	const result = {
		...searchResult,
		products: productsWithDetails.filter((p): p is ProductStateFound<Product> => p !== null),
		total_pages: Math.ceil(searchResult.count / searchResult.page_size)
	};

	return {
		result: result
	};
};