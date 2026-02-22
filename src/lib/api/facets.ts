import type { KnowledgePanel } from './knowledgepanels';
import type { FacetSortOption as ProductFacetsSortOption } from '@openfoodfacts/openfoodfacts-nodejs';
import { createProductsApi } from './product';

export const FACETS_SORT_OPTIONS = [
	'last_modified_t',
	'popularity',
	'environmental_score_score',
	'created_t'
] as const satisfies readonly ProductFacetsSortOption[];

export type FacetSortOption = ProductFacetsSortOption;

export async function getFacet(
	fetch: typeof window.fetch,
	facet: string,
	opts?: { page?: number; pageSize?: number; sortBy?: FacetSortOption }
) {
	const client = createProductsApi(fetch);
	return client.getFacet(facet, opts);
}

export async function getFacetValue(
	fetch: typeof window.fetch,
	facet: string,
	value: string,
	opts: { page?: number; pageSize?: number; sortBy?: FacetSortOption }
) {
	const client = createProductsApi(fetch);
	return client.getFacetValue(facet, value, opts);
}

const FACETS_KP_HOST = 'https://facets-kp.openfoodfacts.org';

export type FacetKnowledgePanelResponse = {
	knowledge_panels: Record<string, KnowledgePanel>;
};

export async function getFacetKnowledgePanels(
	fetch: typeof window.fetch,
	facet: string,
	value?: string
) {
	const params = new URLSearchParams({
		facet_tag: facet
	});
	if (value) {
		params.set('value_tag', value);
	}

	const response = await fetch(`${FACETS_KP_HOST}/knowledge_panel?${params}`);
	return (await response.json()) as FacetKnowledgePanelResponse;
}
