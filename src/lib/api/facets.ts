import type { KnowledgePanel } from './knowledgepanels';
import type { FacetSortOption as ProductFacetsSortOption } from '@openfoodfacts/openfoodfacts-nodejs';
import { createProductsApi } from './product';

// TODO: Remove 'nutriscore_score' workaround once the SDK is updated
export type FacetSortOption = ProductFacetsSortOption | 'nutriscore_score';

export const FACETS_SORT_OPTIONS = [
	'last_modified_t',
	'popularity',
	'environmental_score_score',
	'created_t',
	'nutriscore_score'
] as const satisfies readonly FacetSortOption[];

export async function getFacet(
	fetch: typeof window.fetch,
	facet: string,
	opts?: { page?: number; pageSize?: number; sortBy?: FacetSortOption }
) {
	const client = createProductsApi(fetch);
	// @ts-expect-error - TODO: sortBy does not contain all possible values
	return client.getFacet(facet, opts);
}

export async function getFacetValue(
	fetch: typeof window.fetch,
	facet: string,
	value: string,
	opts: { page?: number; pageSize?: number; sortBy?: FacetSortOption }
) {
	const client = createProductsApi(fetch);
	// @ts-expect-error - TODO: sortBy does not contain all possible values
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
	if (!response.ok) {
		throw new Error(
			`Failed to fetch facet knowledge panels: ${response.status} ${response.statusText}`
		);
	}
	return (await response.json()) as FacetKnowledgePanelResponse;
}
