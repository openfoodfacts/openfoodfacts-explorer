import type { KnowledgePanels } from './knowledgepanels';
import type { FacetSortOption as ProductFacetsSortOption } from '@openfoodfacts/openfoodfacts-nodejs';
import { createProductsApi } from './product';
import { API_HOST } from '#lib/const.js';

export type FacetSortOption = ProductFacetsSortOption;

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

export type DataQualityErrorTag = { id: string; name: string; products: number };

/**
 * The data quality errors found in the products edited by a user, most frequent first.
 * A second facet level lists the values of that facet (error types with their number of
 * products), not products, so the SDK's `getFacetValue` typing does not apply.
 */
export async function getEditorDataQualityErrors(
	fetch: typeof window.fetch,
	editor: string,
	pageSize: number
): Promise<{ count: number; tags: DataQualityErrorTag[] }> {
	const params = new URLSearchParams({ page: '1', page_size: `${pageSize}` });
	const response = await fetch(
		`${API_HOST}/facets/editors/${encodeURIComponent(editor)}/data-quality-errors.json?${params}`
	);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch data quality errors: ${response.status} ${response.statusText}`
		);
	}
	return await response.json();
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
