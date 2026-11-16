import type { KnowledgePanels } from './knowledgepanels';
import type { FacetSortOption as ProductFacetsSortOption } from '@openfoodfacts/openfoodfacts-nodejs';
import { createProductsApi } from './product';

export type FacetSortOption = ProductFacetsSortOption;

export const FACETS_SORT_OPTIONS = [
	'last_modified_t',
	'popularity',
	'environmental_score_score',
	'created_t',
	'nutriscore_score'
] as const satisfies readonly FacetSortOption[];

export type FacetPair = { facet: string; value: string };

/**
 * Read the facet/value pairs of a facet page, e.g. /facets/brands/ferrero/categories/en:spreads.
 *
 * @param rest the path after the first facet and value, such as "categories/en:spreads"
 * @returns the pairs, or null when a facet has no value, a part is empty or a facet repeats
 */
export function getFacetPairs(facet: string, value: string, rest: string): FacetPair[] | null {
	const pairs: FacetPair[] = [{ facet, value }];
	let parts: string[];
	if (rest === '') {
		parts = [];
	} else {
		parts = rest.split('/');
	}

	if (parts.length % 2 !== 0 || parts.includes('')) return null;

	for (let i = 0; i < parts.length; i += 2) {
		pairs.push({ facet: parts[i], value: parts[i + 1] });
	}

	const facets = pairs.map((pair) => pair.facet);
	if (new Set(facets).size !== facets.length) return null;
	return pairs;
}

// Build the page path for facet/value pairs
export function getFacetPairsPath(pairs: FacetPair[]): string {
	const parts = pairs.map((pair) => `${pair.facet}/${pair.value}`);
	return `/facets/${parts.join('/')}`;
}

/**
 * Load the products matching every facet/value pair from Product Opener.
 * Used for nested facet pages when Query is not available.
 */
export async function getProductsForFacetFilter(
	fetch: typeof window.fetch,
	filter: Record<string, string>,
	opts: { page: number; pageSize: number; sortBy?: FacetSortOption }
) {
	const client = createProductsApi(fetch);
	const params: Record<string, string> = {
		...filter,
		page: String(opts.page),
		page_size: String(opts.pageSize)
	};
	if (opts.sortBy) params.sort_by = opts.sortBy;

	const { data, error } = await client.apiv2.search(params);
	if (!data) throw new Error(`Facet search failed: ${error || 'unknown error'}`);
	return data;
}

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
