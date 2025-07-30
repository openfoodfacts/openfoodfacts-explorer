import {
	SearchApi,
	type AutocompleteQuery,
	type Product
} from '@openfoodfacts/openfoodfacts-nodejs';

export function getSearchBaseUrl() {
	if (import.meta.env.VITE_SEARCH_BASE_URL == '') {
		throw new Error(
			'VITE_SEARCH_BASE_URL is not set. Please set it in your environment variables.'
		);
	}

	return import.meta.env.VITE_SEARCH_BASE_URL;
}

export const autocomplete = async (
	query: AutocompleteQuery,
	fetch: typeof window.fetch
): Promise<AutocompleteResponse> => {
	const api = new SearchApi(fetch, { baseUrl: getSearchBaseUrl() });
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
	hits: Array<Product>;
	is_count_exact: boolean;
	page: number;
	page_count: number;
	page_size: number;
	timed_out: boolean;
	took: number;
	warnings: unknown;
};
