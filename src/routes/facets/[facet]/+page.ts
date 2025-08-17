import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { KnowledgePanel } from '$lib/api';

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

	const facetKnowledgePanels = (await (
		await fetch(`https://facets-kp.openfoodfacts.org/knowledge_panel?facet_tag=${facet}`)
	).json()) as {
		knowledge_panels: Record<string, KnowledgePanel>;
	};

	const pages = Math.ceil(results.count / 100);

	return { facet, results, pages, page, knowledgePanels: facetKnowledgePanels.knowledge_panels };
};
