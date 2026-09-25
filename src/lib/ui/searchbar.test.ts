import { describe, expect, it, vi } from 'vitest';

import { deduplicateAutocompleteOptions, fetchBrandSuggestions } from './searchbar';
import type { AutocompleteOption } from '$lib/api/search';
import { getTaxonomySuggestions } from '$lib/api/product';

// Mock getTaxonomySuggestions
vi.mock('$lib/api/product', () => ({
	getTaxonomySuggestions: vi.fn()
}));

describe('deduplicateAutocompleteOptions', () => {
	it('removes duplicate entries case-insensitively', () => {
		const options: AutocompleteOption[] = [
			{ id: '1', text: 'Nutella', taxonomy_name: 'brands' },
			{ id: '2', text: 'nutella', taxonomy_name: 'categories' },
			{ id: '3', text: 'NUTELLA', taxonomy_name: 'labels' }
		];

		const result = deduplicateAutocompleteOptions(options);

		expect(result).toHaveLength(1);
		expect(result[0].text).toBe('Nutella');
		expect(result[0].id).toBe('1');
	});

	it('preserves brand suggestions when they appear first', () => {
		const options: AutocompleteOption[] = [
			{ id: 'brand-1', text: 'Nestlé', taxonomy_name: 'brands' },
			{ id: 'cat-1', text: 'nestlé', taxonomy_name: 'categories' }
		];

		const result = deduplicateAutocompleteOptions(options);

		expect(result).toHaveLength(1);
		expect(result[0].text).toBe('Nestlé');
		expect(result[0].taxonomy_name).toBe('brands');
	});

	it('keeps all unique entries', () => {
		const options: AutocompleteOption[] = [
			{ id: '1', text: 'Nutella', taxonomy_name: 'brands' },
			{ id: '2', text: 'Ferrero', taxonomy_name: 'brands' },
			{ id: '3', text: 'Organic', taxonomy_name: 'categories' }
		];

		const result = deduplicateAutocompleteOptions(options);

		expect(result).toHaveLength(3);
	});

	it('handles empty array', () => {
		const result = deduplicateAutocompleteOptions([]);

		expect(result).toEqual([]);
	});

	it('handles single entry', () => {
		const options: AutocompleteOption[] = [{ id: '1', text: 'Nutella', taxonomy_name: 'brands' }];

		const result = deduplicateAutocompleteOptions(options);

		expect(result).toEqual(options);
	});

	it('preserves order of first occurrence', () => {
		const options: AutocompleteOption[] = [
			{ id: '1', text: 'Brand A', taxonomy_name: 'brands' },
			{ id: '2', text: 'Category B', taxonomy_name: 'categories' },
			{ id: '3', text: 'brand a', taxonomy_name: 'labels' },
			{ id: '4', text: 'Category C', taxonomy_name: 'categories' }
		];

		const result = deduplicateAutocompleteOptions(options);

		expect(result).toHaveLength(3);
		expect(result[0].text).toBe('Brand A');
		expect(result[1].text).toBe('Category B');
		expect(result[2].text).toBe('Category C');
	});

	it('handles special characters and accents', () => {
		const options: AutocompleteOption[] = [
			{ id: '1', text: 'Café', taxonomy_name: 'brands' },
			{ id: '2', text: 'café', taxonomy_name: 'categories' },
			{ id: '3', text: 'cafe', taxonomy_name: 'labels' }
		];

		const result = deduplicateAutocompleteOptions(options);

		// Case-insensitive but accent-sensitive
		expect(result).toHaveLength(2);
		expect(result[0].text).toBe('Café');
		expect(result[1].text).toBe('cafe');
	});
});

describe('fetchBrandSuggestions', () => {
	it('successfully maps suggestions to AutocompleteOption shape', async () => {
		const mockFetch = vi.fn();
		vi.mocked(getTaxonomySuggestions).mockResolvedValue({
			data: { suggestions: ['Nestlé', 'Ferrero', 'Danone'] }
		} as never);

		const result = await fetchBrandSuggestions(mockFetch, 'nes', 5);

		expect(result).toEqual([
			{ id: 'brand-Nestlé', text: 'Nestlé', taxonomy_name: 'brands' },
			{ id: 'brand-Ferrero', text: 'Ferrero', taxonomy_name: 'brands' },
			{ id: 'brand-Danone', text: 'Danone', taxonomy_name: 'brands' }
		]);
	});

	it('returns empty array when suggestions array is empty', async () => {
		const mockFetch = vi.fn();
		vi.mocked(getTaxonomySuggestions).mockResolvedValue({
			data: { suggestions: [] }
		} as never);

		const result = await fetchBrandSuggestions(mockFetch, 'xyz', 5);

		expect(result).toEqual([]);
	});

	it('returns empty array when data is missing', async () => {
		const mockFetch = vi.fn();
		vi.mocked(getTaxonomySuggestions).mockResolvedValue({} as never);

		const result = await fetchBrandSuggestions(mockFetch, 'test', 5);

		expect(result).toEqual([]);
	});

	it('returns empty array on error', async () => {
		const mockFetch = vi.fn();
		vi.mocked(getTaxonomySuggestions).mockResolvedValue({
			error: new Error('API error')
		} as never);

		const result = await fetchBrandSuggestions(mockFetch, 'test', 5);

		expect(result).toEqual([]);
	});

	it('returns empty array when getTaxonomySuggestions throws', async () => {
		const mockFetch = vi.fn();
		vi.mocked(getTaxonomySuggestions).mockRejectedValue(new Error('Network error'));

		const result = await fetchBrandSuggestions(mockFetch, 'test', 5);

		expect(result).toEqual([]);
	});
});
