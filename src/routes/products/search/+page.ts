import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Product } from '$lib/api';

const SORT_OPTIONS: Record<string, string> = {
	relevance: '',
	nutrition_grade: 'nutriscore_score',
	ecoscore: 'ecoscore_score'
};

const DEFAULT_SORT_ORDERS: Record<string, string> = {
	relevance: 'desc',
	nutrition_grade: 'asc',
	ecoscore: 'desc'
};

export const load: PageLoad = async ({ fetch, url }) => {
	const query = url.searchParams.get('q');

	if (query == null || query.length === 0) {
		throw error(400, 'Missing query parameter');
	}

	if (query.match(/^\d{13}$/)) {
		throw redirect(308, `/products/${query}`);
	}

	const page = url.searchParams.get('page') || '1';
	const sortBy = url.searchParams.get('sort_by') || 'relevance';
	const sortOrder = DEFAULT_SORT_ORDERS[sortBy] || 'desc';

	const urlSearch = new URLSearchParams({
		search_terms: query,
		search_simple: '1',
		json: '1',
		page: page
	});

	if (sortBy !== 'relevance' && SORT_OPTIONS[sortBy]) {
		urlSearch.set('sort_by', SORT_OPTIONS[sortBy]);
		urlSearch.set('sort_order', sortOrder);
	}

	try {
		const response = await fetch(
			`https://world.openfoodfacts.org/cgi/search.pl?${urlSearch.toString()}`
		);

		if (!response.ok) {
			throw error(400, 'Failed to fetch data');
		}

		const data = await response.json();

		const result = {
			...data,
			total_pages: Math.ceil(data.count / data.page_size)
		};

		return {
			result: result,
			sortBy,
			sortOrder,
			sortOptions: Object.keys(SORT_OPTIONS)
		};
	} catch (err) {
		throw error(500, 'Error loading data');
	}
};
