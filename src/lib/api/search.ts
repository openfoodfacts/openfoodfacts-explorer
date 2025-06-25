import { SearchApi, type AutocompleteQuery } from '@openfoodfacts/openfoodfacts-nodejs';

export function getSearchBaseUrl(): string {
	return import.meta.env.VITE_SEARCH_BASE_URL || new URL(import.meta.url).origin + '/api/search';
}

const api = new SearchApi(fetch, { baseUrl: getSearchBaseUrl() });

export async function autocomplete(query: AutocompleteQuery) {
	if (query.length < 3) {
		return { suggestions: [] };
	}

	const response = await api.autocomplete(query);
	console.log('Autocomplete response:', response);
	return response.data;
}

export type AutocompleteOption = {
	id: string;
	text: string;
	taxonomy_name: string;
};

export type AutocompleteResponse = {
	options: AutocompleteOption[];
};
