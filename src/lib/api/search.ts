import { SearchApi, type Product } from '@openfoodfacts/openfoodfacts-nodejs';
import type { ProductReduced } from './product';
import { ssrSafeFetch, wrapFetchWithCredentials } from './utils';
import { env } from '$env/dynamic/public';
import { browser } from '$app/environment';

export function getSearchBaseUrl() {
	if (browser) {
		return '/api/search';
	}
	const searchBaseUrl = env.PUBLIC_SEARCH_BASE_URL;
	if (searchBaseUrl == null || searchBaseUrl === '') {
		return 'https://search.openfoodfacts.org';
	}
	return searchBaseUrl;
}

export function createSearchApi(fetch: typeof window.fetch): SearchApi {
	const searchBaseUrl = getSearchBaseUrl();
	const rawUrl = browser ? new URL(searchBaseUrl, window.location.origin) : new URL(searchBaseUrl);
	const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(ssrSafeFetch(fetch), rawUrl);
	return new SearchApi(wrappedFetch, { baseUrl: url.toString() });
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
