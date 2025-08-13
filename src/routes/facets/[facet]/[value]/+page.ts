import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const { facet, value } = params;
	const pageStr = url.searchParams.get('page') || '1';

	let page: number;
	try {
		page = parseInt(pageStr, 10);
	} catch {
		error(400, 'Invalid page number');
	}

	const offParams = new URLSearchParams({
		page: page.toString()
	});

	const results = (await (
		await fetch(
			`https://world.openfoodfacts.org/facets/${facet}/${value}.json?${offParams.toString()}`
		)
	).json()) as {
		count: number;
		page: number;
		page_count: number;
		page_size: number;
		products: Product[];
		skip: number;
	};

	return { facet, value, results };
};
