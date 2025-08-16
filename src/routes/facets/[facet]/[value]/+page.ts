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

	const results: Promise<{
		count: number;
		page: number;
		page_count: number;
		page_size: number;
		products: Product[];
		skip: number;
	}> = fetch(`https://world.openfoodfacts.org/facets/${facet}/${value}.json?${offParams}`)
		.then((res) => res.json())
		// TODO: this is because the "page" field is a string.
		// The server should output a number here!
		.then((it) => ({
			...it,
			page: parseInt(it.page, 10)
		}));

	const facetKnowledgePanels: Promise<{ knowledge_panels: Record<string, KnowledgePanel> }> = fetch(
		`https://facets-kp.openfoodfacts.org/knowledge_panel?facet_tag=${facet}&value_tag=${value}`
	).then((res) => res.json());

	return {
		facet: { name: facet, value },
		results: await results,
		knowledgePanels: (await facetKnowledgePanels).knowledge_panels
	};
};
