import {
	createSearchApi,
	type AutocompleteOption,
	type AutocompleteResponse
} from '#lib/api/search.js';
import { getTaxonomySuggestions } from '#lib/api/product.js';
import { deduplicate } from '#lib/utils.js';

export async function fetchAutocompleteOptions(
	fetchFn: typeof fetch,
	query: string,
	language: string,
	size: number
): Promise<AutocompleteOption[]> {
	const brandSuggestionsPromise = fetchBrandSuggestions(fetchFn, query, size);
	const searchApi = createSearchApi(fetchFn);
	const searchSuggestionsPromise = searchApi
		.autocomplete({
			q: query,
			taxonomy_names: 'categories,labels',
			lang: language,
			size,
			fuzziness: null,
			index_id: null
		})
		.then((result) => {
			if (result.error || !result.data) {
				console.warn('Search-a-licious autocomplete error:', result.error);
				return [];
			}
			const data = result.data as AutocompleteResponse | undefined;
			return Array.isArray(data?.options) ? data.options : [];
		});

	const [brandSuggestions, searchSuggestions] = await Promise.allSettled([
		brandSuggestionsPromise,
		searchSuggestionsPromise
	]);

	return deduplicate(
		[
			...(brandSuggestions.status === 'fulfilled' ? brandSuggestions.value : []),
			...(searchSuggestions.status === 'fulfilled' ? searchSuggestions.value : [])
		],
		(option) => option.text.toLowerCase()
	);
}

/**
 * Fetch brand suggestions from the classic taxonomy suggester and convert to AutocompleteOption format.
 * TODO: When search-a-licious supports brand autocomplete, remove this fallback and use search-a-licious
 * for all taxonomy types (brands, categories, labels).
 * @param fetchFn - The fetch function (may include AbortSignal)
 * @param query - The search query
 * @param size - Maximum number of suggestions to return
 * @returns Array of AutocompleteOption objects for brands
 */
async function fetchBrandSuggestions(
	fetchFn: typeof fetch,
	query: string,
	size: number
): Promise<AutocompleteOption[]> {
	try {
		const result = await getTaxonomySuggestions(fetchFn, 'brands', query, size);
		if (!result.data) {
			console.warn('Brand taxonomy suggestions returned no data');
			return [];
		}
		const suggestions = result.data.suggestions ?? [];
		return suggestions.map((brand: string) => ({
			id: `brand-${brand}`,
			text: brand,
			taxonomy_name: 'brands'
		}));
	} catch (e) {
		console.warn('Brand taxonomy suggestions error:', e);
		return [];
	}
}
