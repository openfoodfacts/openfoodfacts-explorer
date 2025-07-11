import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { SearchApi, type SearchBody } from '@openfoodfacts/openfoodfacts-nodejs';
import { getSearchBaseUrl, type SearchResult } from '$lib/api/search';

export const ssr = false;

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
	const sortBy = url.searchParams.get('sort_by') || '-unique_scans_n';

	if (query == null || query.length === 0) {
		error(400, 'Missing query parameter');
	}

	// If the code is an EAN13 code, we can directly fetch the product
	if (isValidEAN13(query)) {
		redirect(308, `/products/${query}`);
	}

	const page = url.searchParams.get('page') || '1';
	const pageSize = url.searchParams.get('page_size') || 6 * 4;

	const api = new SearchApi(fetch, { baseUrl: getSearchBaseUrl() });

	const params: SearchBody = {
		q: query,
		page: page,
		page_size: pageSize,
		facets: ['brands_tags', 'categories_tags', 'nutrition_grades', 'ecoscore_grade'],
		sort_by: sortBy
	};

	const result = (await api.search(params).then((result) => result.data as SearchResult)) ?? {};

	return {
		query,
		search: result
	};
};
