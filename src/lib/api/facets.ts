import type { KnowledgePanels } from './knowledgepanels';
import type { FacetSortOption as ProductFacetsSortOption } from '@openfoodfacts/openfoodfacts-nodejs';
import { API_HOST } from '#lib/const.js';
import { wrapFetchWithAuth } from '#lib/stores/auth.js';
import { createProductsApi } from './product';

export type FacetSortOption = ProductFacetsSortOption;

export const FACETS_SORT_OPTIONS = [
	'last_modified_t',
	'popularity',
	'environmental_score_score',
	'created_t',
	'nutriscore_score'
] as const satisfies readonly FacetSortOption[];

export const FACET_STATUS_OPTIONS = ['known', 'unknown'] as const;
export type FacetStatus = (typeof FACET_STATUS_OPTIONS)[number];

export async function getFacet(
	fetch: typeof window.fetch,
	facet: string,
	opts?: { page?: number; pageSize?: number; sortBy?: FacetSortOption }
) {
	const client = createProductsApi(fetch);
	return client.getFacet(facet, opts);
}

/**
 * Filter the whole facet by value name and/or known status.
 * The server scans every value of the facet, so this can take up to a minute,
 * and it returns all matches at once: `page` and `page_size` are ignored
 * and `count` is still the unfiltered total.
 */
export async function filterFacet(
	fetch: typeof window.fetch,
	facet: string,
	opts: { filter?: string; status?: FacetStatus }
): Promise<Awaited<ReturnType<typeof getFacet>>> {
	const params = new URLSearchParams();
	if (opts.filter) params.set('filter', opts.filter);
	if (opts.status) params.set('status', opts.status);

	const response = await wrapFetchWithAuth(fetch)(
		`${API_HOST}/facets/${encodeURIComponent(facet)}.json?${params}`
	);
	if (!response.ok) {
		throw new Error(`Failed to filter facet: ${response.status} ${response.statusText}`);
	}
	return response.json();
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

	const response = await fetch(`${FACETS_KP_HOST}/knowledge_panel?${params}`);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch facet knowledge panels: ${response.status} ${response.statusText}`
		);
	}
	return (await response.json()) as FacetKnowledgePanelResponse;
}
