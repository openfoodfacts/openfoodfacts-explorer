import type { AutocompleteOption } from '$lib/api/search';
import { getTaxonomySuggestions } from '$lib/api/product';

type TaxonomySuggestionsResult = {
	data?: { suggestions?: string[] };
	error?: unknown;
};

/**
 * Deduplicate autocomplete options by text (case-insensitive), preserving order.
 * Brands should be passed first to ensure they are prioritized in the result.
 */
export function deduplicateAutocompleteOptions(
	options: AutocompleteOption[]
): AutocompleteOption[] {
	const seenTexts = new Set<string>();
	const deduplicated: AutocompleteOption[] = [];

	for (const option of options) {
		const lowerText = option.text.toLowerCase();
		if (!seenTexts.has(lowerText)) {
			seenTexts.add(lowerText);
			deduplicated.push(option);
		}
	}

	return deduplicated;
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
export async function fetchBrandSuggestions(
	fetchFn: typeof fetch,
	query: string,
	size: number
): Promise<AutocompleteOption[]> {
	try {
		const result = (await getTaxonomySuggestions(
			fetchFn,
			'brands',
			query,
			size
		)) as TaxonomySuggestionsResult;
		if (result.error || !result.data) {
			console.warn('Brand taxonomy suggestions error:', result.error);
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
