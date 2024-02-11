import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Product } from '$lib/api';

export const load: PageLoad = async ({ fetch, url }) => {
	const query = url.searchParams.get('q');

	if (query == null || query.length === 0) {
		error(400, 'Missing query parameter');
	}

	const page = url.searchParams.get('page') || '1';

	const urlSearch = new URLSearchParams({
		search_terms: query,
		search_simple: '1',
		json: '1',
		page: page
	});

	const result = fetch(`https://world.openfoodfacts.org/cgi/search.pl?` + urlSearch.toString())
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

	return {
		result: result
	};
};
