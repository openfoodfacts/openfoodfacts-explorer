import type { KnowledgePanels } from './knowledgepanels';
import type {
	FacetResponse,
	FacetSortOption as ProductFacetsSortOption
} from '@openfoodfacts/openfoodfacts-nodejs';
import { API_HOST } from '#lib/const.js';
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

export type FacetDrilldown = { pairs: FacetPair[]; listFacet: string };

/**
 * Read a drilldown path, which lists the values of one facet for the products of some pairs,
 * e.g. /facets/brands/ferrero/categories lists the categories of Ferrero products.
 *
 * @param path the path after the first facet and value, such as "categories"
 * or "labels/en:organic/categories"
 * @returns the pairs and the facet to list, or null when the path is not a valid drilldown
 */
export function getFacetDrilldown(
	facet: string,
	value: string,
	path: string
): FacetDrilldown | null {
	const parts = path.split('/');
	const listFacet = parts.pop();
	if (!listFacet) return null;

	const pairs = getFacetPairs(facet, value, parts.join('/'));
	if (pairs == null) return null;

	// Listing a facet that is already filtered on would only show its own value
	for (const pair of pairs) {
		if (pair.facet === listFacet) return null;
	}
	return { pairs, listFacet };
}

// Build the page path for facet/value pairs
export function getFacetPairsPath(pairs: FacetPair[]): string {
	const parts = pairs.map(
		(pair) => `${encodeURIComponent(pair.facet)}/${encodeURIComponent(pair.value)}`
	);
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
	const sortBy = opts.sortBy ?? 'last_modified_t';
	const params: Record<string, string> = {
		...filter,
		page: String(opts.page),
		page_size: String(opts.pageSize),
		sort_by: sortBy
	};

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

/**
 * Load the values of a facet for the products of some pairs from Product Opener,
 * e.g. /facets/brands/ferrero/categories.json. Used when Query is not available.
 */
export async function getFacetForPairs(
	fetch: typeof window.fetch,
	drilldown: FacetDrilldown,
	opts: { page: number; pageSize: number }
): Promise<FacetResponse> {
	const params = new URLSearchParams({
		page: String(opts.page),
		page_size: String(opts.pageSize)
	});
	const path = `${getFacetPairsPath(drilldown.pairs)}/${encodeURIComponent(drilldown.listFacet)}`;

	const response = await fetch(`${API_HOST}${path}.json?${params}`);
	if (!response.ok) throw new Error(`Facet request failed: HTTP ${response.status}`);
	return (await response.json()) as FacetResponse;
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
