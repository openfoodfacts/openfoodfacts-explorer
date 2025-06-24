import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { SearchApi, type Product } from '@openfoodfacts/openfoodfacts-nodejs';

export const ssr = false;

const SEARCH_BASE_URL =
	import.meta.env.VITE_SEARCH_BASE_URL || new URL(import.meta.url).origin + '/api/search';

// TODO: This should be not necessary.
// We should use the SDK types.
type SearchResult = Promise<{
	data: {
		aggregations: null;
		charts: object;
		count: number;
		debug: object;
		facets: object;
		hits: Array<Product>;
		is_count_exact: boolean;
		page: number;
		page_count: number;
		page_size: number;
		timed_out: boolean;
		took: number;
		warnings: unknown;
	};
}>;

function isValidEAN13(code: string): boolean {
	if (!/^\d{13}$/.test(code)) {
		return false;
	}

	const digits = code.split('').map(Number);
	const checksum =
		digits.slice(0, 12).reduce((sum, digit, index) => {
			return sum + digit * (index % 2 === 0 ? 1 : 3);
		}, 0) % 10;

	const checkDigit = (10 - checksum) % 10;
	return checkDigit === digits[12];
}

export const load: PageLoad = async ({ fetch, url }) => {
	const query = url.searchParams.get('q');

	if (query == null || query.length === 0) {
		error(400, 'Missing query parameter');
	}

	// If the code is an EAN13 code, we can directly fetch the product
	if (isValidEAN13(query)) {
		redirect(308, `/products/${query}`);
	}

	const page = url.searchParams.get('page') || '1';
	const pageSize = url.searchParams.get('page_size') || 6 * 4;

	const api = new SearchApi(fetch, { baseUrl: SEARCH_BASE_URL });

	const result = (
		api.search({
			q: query,
			page: page,
			page_size: pageSize
		}) as SearchResult
	) //
		.then((result) => result.data);

	return { query, search: result };
};
