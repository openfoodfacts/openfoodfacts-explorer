import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
import type { KnowledgePanel } from '$lib/api/knowledgepanels';

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

	const facetKnowledgePanels = (await (
		await fetch(
			`https://facets-kp.openfoodfacts.org/knowledge_panel?facet_tag=${facet}&value_tag=${value}`
		)
	).json()) as {
		knowledge_panels: Record<string, KnowledgePanel>;
	};

	return { facet, value, results, knowledgePanels: facetKnowledgePanels.knowledge_panels };
};
