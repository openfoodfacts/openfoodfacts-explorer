import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params, url }) => {
	const { facet } = params;
	const pageStr = url.searchParams.get('page') || '1';

	let page: number;
	try {
		page = parseInt(pageStr, 10);
	} catch {
		error(400, 'Invalid page number');
	}

	const results = (await (
		await fetch(`https://world.openfoodfacts.org/facets/${facet}/${page}.json`)
	).json()) as {
		count: number;
		tags: { id: string; known: number; name: string; products: number }[];
	};

	const pages = Math.ceil(results.count / 100);

	return { facet, results, pages, page };
};
