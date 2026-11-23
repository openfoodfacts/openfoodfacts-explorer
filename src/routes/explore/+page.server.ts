import { PUBLIC_QUERY_BASE_URL } from '$app/env/public';
import { createQueryProductApi } from '#lib/server/query-product-api.js';
import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = async ({ fetch }) => {
	if (!PUBLIC_QUERY_BASE_URL) return { querySections: null };

	const api = createQueryProductApi(fetch, PUBLIC_QUERY_BASE_URL);

	const fetchCategoryProducts = async (category: string) => {
		try {
			const { data, response } = await api.POST('/find', {
				signal: AbortSignal.timeout(5000),
				body: {
					filter: { categories_tags: `en:${category.toLowerCase()}` },
					projection: { code: true, scans_n: true },
					sort: [['popularity_key', -1]],
					limit: 6,
					skip: 0
				}
			});
			if (!response.ok || !Array.isArray(data)) throw new Error('Invalid Query response');
			const products = data.filter(
				(product): product is { code: string; scans_n?: number } =>
					typeof product.code === 'string' && product.code.length > 0
			);
			return {
				category,
				products: products.map(({ code, scans_n }) => ({
					code,
					...(typeof scans_n === 'number' ? { scans_n } : {})
				}))
			};
		} catch (error) {
			console.error('Explore Query request failed', { category, error });
			return null;
		}
	};

	const querySections = await Promise.all(categories.map(fetchCategoryProducts));
	return { querySections };
};
