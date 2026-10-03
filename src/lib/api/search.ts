import { SearchApi, type Product, type SearchBody } from '@openfoodfacts/openfoodfacts-nodejs';
import type { ProductReduced } from './product';
import { wrapFetchWithCredentials } from './utils';
import { env } from '$env/dynamic/public';

/**
 * Retrieves the base URL for the Search API from environment variables.
 *
 * @throws {Error} If PUBLIC_SEARCH_BASE_URL is not configured.
 * @returns {string} The base URL for search requests.
 */
export function getSearchBaseUrl() {
	const searchBaseUrl = env.PUBLIC_SEARCH_BASE_URL;
	if (searchBaseUrl == null || searchBaseUrl === '') {
		throw new Error(
			'PUBLIC_SEARCH_BASE_URL is not set. Please set it in your environment variables.'
		);
	}
	return searchBaseUrl;
}

/**
 * Creates an instance of SearchApi configured with credentials and baseUrl.
 *
 * @param {typeof window.fetch} fetch - The fetch implementation to use.
 * @returns {SearchApi} The initialized SearchApi instance.
 */
export function createSearchApi(fetch: typeof window.fetch): SearchApi {
	const searchBaseUrl = getSearchBaseUrl();
	const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(searchBaseUrl));
	return new SearchApi(wrappedFetch, { baseUrl: url.toString() });
}

export const DEFAULT_SEARCH_FACETS = [
	'brands',
	'categories',
	'nutrition_grades',
	'environmental_score_grade',
	'nova_group',
	'labels',
	'countries',
	'allergens',
	'additives',
	'stores',
	'languages'
];

export const FALLBACK_SEARCH_FACETS = [
	'brands',
	'categories',
	'nutrition_grades',
	'environmental_score_grade'
];

export const DEFAULT_SEARCH_CHARTS: NonNullable<SearchBody['charts']> = [
	{ chart_type: 'DistributionChart', field: 'nutrition_grades' },
	{ chart_type: 'DistributionChart', field: 'environmental_score_grade' },
	{ chart_type: 'DistributionChart', field: 'nova_group' },
	{ chart_type: 'ScatterChart', x: 'nutriscore_score', y: 'nutriments.fiber_100g' }
];

export const FALLBACK_SEARCH_CHARTS = [
	{ chart_type: 'DistributionChartType', field: 'nutrition_grades' },
	{ chart_type: 'DistributionChartType', field: 'environmental_score_grade' },
	{ chart_type: 'DistributionChartType', field: 'nova_group' },
	{ chart_type: 'ScatterChartType', x: 'nutriscore_score', y: 'nutriments.fiber_100g' }
];

/**
 * Executes a search query using the new Search API format first,
 * falling back to the legacy format for compatibility with deployments
 * running the older search backend (such as production search.openfoodfacts.org).
 *
 * @param {typeof fetch} baseFetch - The fetch implementation to use.
 * @param {Omit<SearchBody, 'facets' | 'charts'>} params - The search parameters without facets/charts.
 * @returns {ReturnType<SearchApi['search']>} The search response containing hits, facets, and charts.
 */
// FIXME: We can drop this compatibility layer once the new API is deployed in production
export async function compatSearch(
	baseFetch: typeof fetch,
	params: Omit<SearchBody, 'facets' | 'charts'>
): ReturnType<SearchApi['search']> {
	const api = createSearchApi(baseFetch);

	// Try the new API first
	const newParams: SearchBody = {
		...params,
		facets: DEFAULT_SEARCH_FACETS,
		charts: DEFAULT_SEARCH_CHARTS
	};

	try {
		const res = await api.search(newParams);

		if (res.error || res.data == null) {
			console.error('Search API newParams error:', res.error);
			throw res.error || new Error('No data');
		}
		// @ts-expect-error - data is unknown
		return { data: res.data };
	} catch (e) {
		console.warn('search: API failed, falling back to basic facets:', e);
	}

	const oldParams = {
		...params,
		facets: FALLBACK_SEARCH_FACETS,
		charts: FALLBACK_SEARCH_CHARTS
	};

	// @ts-expect-error - legacy search API parameters fallback for production (search.openfoodfacts.org)
	return api.search(oldParams);
}

export type AutocompleteOption = {
	id: string;
	text: string;
	taxonomy_name: string;
};

export type AutocompleteResponse = {
	options: AutocompleteOption[];
};

export type FacetItem = {
	key: string;
	name: string;
	count: number;
	selected: boolean;
};

export type Facet = {
	name: string;
	items: FacetItem[];
	count_error_margin: number;
};

export type FacetResult = Record<string, Facet>;

// TODO: This should not be necessary.
// We should use the SDK types.
export type SearchResult = {
	aggregations: null;
	charts: Record<string, object>;
	count: number;
	debug: object;
	facets: FacetResult;
	hits: Array<Product & ProductReduced>;
	is_count_exact: boolean;
	page: number;
	page_count: number;
	page_size: number;
	timed_out: boolean;
	took: number;
	warnings: unknown;
};
