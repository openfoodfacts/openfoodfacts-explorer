import {
	SearchApi,
	type AutocompleteQuery,
	type Product
} from '@openfoodfacts/openfoodfacts-nodejs';
import type { ProductReduced } from './product';
import { wrapFetchWithCredentials } from './utils';
import { env } from '$env/dynamic/public';

/**
 * Returns the base URL for the search API from the PUBLIC_SEARCH_BASE_URL env variable.
 * @throws {Error} If PUBLIC_SEARCH_BASE_URL is not set or empty.
 * @returns The search API base URL string.
 */
export function getSearchBaseUrl() {
	if (!env.PUBLIC_SEARCH_BASE_URL) {
		throw new Error(
			'PUBLIC_SEARCH_BASE_URL is not set. Please set it in your environment variables.'
		);
	}

	return env.PUBLIC_SEARCH_BASE_URL;
}

export function createSearchApi(fetch: typeof window.fetch): SearchApi {
	const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(getSearchBaseUrl()));
	return new SearchApi(wrappedFetch, { baseUrl: url.toString() });
}

/**
 * Fetches autocomplete suggestions for a given query from the search API.
 * @param query - The autocomplete query parameters.
 * @param fetch - The fetch function to use for the request.
 * @returns An AutocompleteResponse with an `options` array, or `{ options: [] }` if the API returns no data.
 */
export const autocomplete = async (
	query: AutocompleteQuery,
	fetch: typeof window.fetch
): Promise<AutocompleteResponse> => {
	const api = createSearchApi(fetch);
	const response = await api.autocomplete(query);
	return (response.data ?? { options: [] }) as AutocompleteResponse;
};

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

// TODO: This should be not necessary.
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
