import { createSearchApi } from '$lib/api/search';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

export const load: PageLoad = async ({ fetch }) => {
	const api = createSearchApi(fetch);

	// Fetch some popular categories for the Explore landing page.
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

	// For each category, fetch a few popular products.
	const sections = await Promise.all(
		categories.map(async (cat) => {
			const { data: searchRes, error: searchError } = (await api.search({
				q: `categories:"en:${cat.toLowerCase()}"`,
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
