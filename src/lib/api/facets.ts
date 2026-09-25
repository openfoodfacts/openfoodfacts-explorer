import type { KnowledgePanels } from './knowledgepanels';
import type { FacetSortOption as ProductFacetsSortOption } from '@openfoodfacts/openfoodfacts-nodejs';
import { createProductsApi } from './product';
import { ssrSafeFetch } from './utils';
export type FacetSortOption = ProductFacetsSortOption | 'nutriscore_score';

export const FACETS_SORT_OPTIONS = [
	'last_modified_t',
	'popularity',
	'environmental_score_score',
	'created_t',
	'nutriscore_score'
] as const satisfies readonly FacetSortOption[];

// TODO: Remove 'nutriscore_score' workaround once the SDK is updated

export async function getFacet(
	fetch: typeof window.fetch,
	facet: string,
	opts?: { page?: number; pageSize?: number; sortBy?: FacetSortOption }
) {
	const client = createProductsApi(ssrSafeFetch(fetch));
	return client.getFacet(facet, opts);
}

export async function getFacetValue(
	fetch: typeof window.fetch,
	facet: string,
	value: string,
	opts: { page?: number; pageSize?: number; sortBy?: FacetSortOption }
) {
	const client = createProductsApi(ssrSafeFetch(fetch));
	return client.getFacetValue(facet, value, opts);
}

import { browser } from '$app/environment';
const FACETS_KP_HOST = browser ? '/proxy/facets-kp' : 'https://facets-kp.openfoodfacts.org';

export type FacetKnowledgePanelResponse = {
	knowledge_panels: KnowledgePanels;
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

	const safeFetch = ssrSafeFetch(fetch);
	const response = await safeFetch(`${FACETS_KP_HOST}/knowledge_panel?${params}`);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch facet knowledge panels: ${response.status} ${response.statusText}`
		);
	}

	const contentType = response.headers.get('content-type') || '';
	if (contentType.includes('text/html')) {
		throw new Error(
			`API returned HTML instead of JSON (Status ${response.status}) for ${response.url}`
		);
	}

	return (await response.json()) as FacetKnowledgePanelResponse;
}
