import { createSearchApi } from '$lib/api/search';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

export const load: PageLoad = async ({ fetch }) => {
	const api = createSearchApi(fetch);

	// Example: fetch some popular categories (replace with real API call as needed)
	const categories = [
		'Snacks',
		'Beverages',
		'Dairies',
		'Breakfasts',
		'Meats',
		'Fruits',
		'Vegetables',
		'Cereals',
		'Sweets',
		'Sauces'
	];

	// For each category, fetch a few products (limit to 4 per category for demo)
	const sections = await Promise.all(
		categories.map(async (cat) => {
			const { data: searchRes, error: searchError } = (await api.search({
				q: `categories:(${cat.toLowerCase()})`,
				page_size: 6,
				langs: ['en'],
				page: 1,
				sort_by: '-scans_n'
			})) as { data: { hits: Product[] }; error?: unknown };

			if (searchError) {
				error(500, 'Failed to fetch products');
			}

			return {
				category: cat,
				products: searchRes.hits || []
			};
		})
	);

	return { sections };
};
