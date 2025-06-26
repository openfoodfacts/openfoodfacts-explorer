import { SearchApi, type AutocompleteQuery } from '@openfoodfacts/openfoodfacts-nodejs';

export function getSearchBaseUrl() {
	return import.meta.env.VITE_SEARCH_BASE_URL || '/api/search';
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
