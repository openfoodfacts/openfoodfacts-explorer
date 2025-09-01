import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';

import { API_HOST } from '$lib/const';
import type { KnowledgePanel } from './knowledgepanels';

export const FACETS_SORT_OPTIONS = [
	'last_modified_t',
	'popularity',
	'environmental_score_score',
	'created_t',
	'nutriscore_score',
	'last_modified_t'
] as const;

export type FacetSortOption = (typeof FACETS_SORT_OPTIONS)[number];

export async function getFacet(
	fetch: typeof window.fetch,
	facet: string,
	opts?: { page?: number; pageSize?: number; sortBy?: FacetSortOption }
) {
	const client = new OpenFoodFacts({ fetch, apiHost: API_HOST });
	// @ts-expect-error - TODO: sortBy does not contain all possible values
	return client.getFacet(facet, opts);
}

export async function getFacetValue(
	fetch: typeof window.fetch,
	facet: string,
	value: string,
	opts: { page?: number; pageSize?: number; sortBy?: FacetSortOption }
) {
	const client = new OpenFoodFacts({ fetch, apiHost: API_HOST });
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
	return (await response.json()) as FacetKnowledgePanelResponse;
}
