import { createSearchApi } from '$lib/api/search';
import type { PageLoad } from './$types';
import type { Product, SearchApi } from '@openfoodfacts/openfoodfacts-nodejs';

type ExploreSection = {
	category: string;
	products: Product[];
};

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
	const sectionsPromise = Promise.all(categories.map((c) => getSomeProducts(api, c)));
	const sections = (await sectionsPromise).filter((s): s is ExploreSection => s != null);

	return { sections };
};

async function getSomeProducts(api: SearchApi, cat: string): Promise<ExploreSection | null> {
	let searchResponse: { data?: { hits?: Product[] }; error?: unknown };

	try {
		searchResponse = (await api.search({
			q: `categories:"en:${cat.toLowerCase()}"`,
			page_size: 6,
			langs: ['en'],
			page: 1,
			sort_by: '-scans_n'
		})) as { data?: { hits?: Product[] }; error?: unknown };
	} catch (cause) {
		console.error('Explore search request failed', { category: cat, cause });
		return null;
	}

	if (searchResponse == null || searchResponse.error != null || searchResponse.data == null) {
		console.error('Explore search API returned an error', {
			category: cat,
			error: searchResponse?.error
		});
		return null;
	}

	const products = searchResponse.data.hits ?? [];
	if (products.length === 0) {
		return null;
	}

	return {
		category: cat,
		products
	};
}
