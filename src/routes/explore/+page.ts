import { createSearchApi } from '$lib/api/search';
import { getBulkProductCardsByCode } from '$lib/api/product';
import type { PageLoad } from './$types';
import type { Product, SearchApi } from '@openfoodfacts/openfoodfacts-nodejs';

type ExploreSection = {
	category: string;
	products: Product[];
};

type ExploreSearchResult = {
	section: ExploreSection | null;
	failed: boolean;
};

export const load: PageLoad = async ({ fetch }) => {
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

	try {
		const api = createSearchApi(fetch);
		const results = await Promise.all(categories.map((category) => getSomeProducts(api, category)));

		return {
			sections: results.flatMap((result) => (result.section ? [result.section] : [])),
			hasSearchError: results.some((result) => result.failed)
		};
	} catch (cause) {
		console.error('Explore search client could not be created', { cause });
		return { sections: [], hasSearchError: true };
	}
};

async function getSomeProducts(api: SearchApi, cat: string): Promise<ExploreSearchResult> {
	let searchResponse: { data?: { hits?: Product[] }; error?: unknown };

	try {
		searchResponse = (await api.search({
			q: `categories_tags:"en:${cat.toLowerCase()}"`,
			page_size: 6,
			langs: ['en'],
			page: 1,
			sort_by: '-unique_scans_n'
		})) as { data?: { hits?: Product[] }; error?: unknown };
	} catch (cause) {
		console.error('Explore search request failed', { category: cat, cause });
		return { section: null, failed: true };
	}

	if (searchResponse == null || searchResponse.error != null || searchResponse.data == null) {
		console.error('Explore search API returned an error', {
			category: cat,
			error: searchResponse?.error
		});
		return { section: null, failed: true };
	}

	const products = searchResponse.data.hits ?? [];
	if (products.length === 0) {
		return { section: null, failed: false };
	}

	return {
		section: {
			category: cat,
			products
		},
		failed: false
	};
}
