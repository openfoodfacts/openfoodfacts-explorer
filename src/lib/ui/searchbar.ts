import type { AutocompleteOption } from '$lib/api/search';

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
