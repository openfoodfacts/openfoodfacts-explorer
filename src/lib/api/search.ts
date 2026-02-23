import {
	SearchApi,
	type AutocompleteQuery,
	type Product
} from '@openfoodfacts/openfoodfacts-nodejs';
import type { ProductReduced } from './product';
import { wrapFetchWithCredentials } from './utils';
import { env } from '$env/dynamic/public';

export function getSearchBaseUrl() {
	if (env.PUBLIC_SEARCH_BASE_URL == '') {
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

export const autocomplete = async (
	query: AutocompleteQuery,
	fetch: typeof window.fetch
): Promise<AutocompleteResponse> => {
	const api = createSearchApi(fetch);
	const response = await api.autocomplete(query);
	return response.data as AutocompleteResponse;
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
