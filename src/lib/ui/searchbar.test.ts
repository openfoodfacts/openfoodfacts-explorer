import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTaxonomySuggestions } from '#lib/api/product.js';
import { createSearchApi, type AutocompleteOption } from '#lib/api/search.js';
import { fetchAutocompleteOptions } from './searchbar';

const { mockAutocomplete } = vi.hoisted(() => ({ mockAutocomplete: vi.fn() }));

vi.mock('#lib/api/search.js', () => ({
	createSearchApi: vi.fn(() => ({ autocomplete: mockAutocomplete }))
}));

vi.mock('#lib/api/product.js', () => ({
	getTaxonomySuggestions: vi.fn()
}));

describe('fetchAutocompleteOptions', () => {
	const fetchFn = vi.fn() as unknown as typeof fetch;
	const categoryOptions: AutocompleteOption[] = [
		{ id: 'category-1', text: 'Organic', taxonomy_name: 'categories' },
		{ id: 'category-2', text: 'Café', taxonomy_name: 'categories' }
	];

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getTaxonomySuggestions).mockResolvedValue({
			data: { suggestions: ['Nestlé', 'Organic'] }
		} as never);
		mockAutocomplete.mockResolvedValue({ data: { options: categoryOptions } });
	});

	it('merges suggestions, prioritizes brands, and deduplicates case-insensitively', async () => {
		const result = await fetchAutocompleteOptions(fetchFn, 'org', 'en', 5);

		expect(result).toEqual([
			{ id: 'brand-Nestlé', text: 'Nestlé', taxonomy_name: 'brands' },
			{ id: 'brand-Organic', text: 'Organic', taxonomy_name: 'brands' },
			categoryOptions[1]
		]);
		expect(getTaxonomySuggestions).toHaveBeenCalledWith(fetchFn, 'brands', 'org', 5);
		expect(createSearchApi).toHaveBeenCalledWith(fetchFn);
		expect(mockAutocomplete).toHaveBeenCalledWith({
			q: 'org',
			taxonomy_names: 'categories,labels',
			lang: 'en',
			size: 5,
			fuzziness: null,
			index_id: null
		});
	});

	it('keeps category and label suggestions when the brand request fails', async () => {
		vi.mocked(getTaxonomySuggestions).mockRejectedValue(new Error('Network error'));

		const result = await fetchAutocompleteOptions(fetchFn, 'org', 'en', 5);

		expect(result).toEqual(categoryOptions);
	});

	it('keeps brand suggestions when the search request fails', async () => {
		mockAutocomplete.mockRejectedValue(new Error('Network error'));

		const result = await fetchAutocompleteOptions(fetchFn, 'org', 'en', 5);

		expect(result).toEqual([
			{ id: 'brand-Nestlé', text: 'Nestlé', taxonomy_name: 'brands' },
			{ id: 'brand-Organic', text: 'Organic', taxonomy_name: 'brands' }
		]);
	});
});
