import { describe, expect, it } from 'vitest';
import type { Country, Taxonomy } from '@openfoodfacts/openfoodfacts-nodejs';
import { buildCountryData } from './country-data';

/**
 * Regression test for CountriesMap missing-vs-zero data bug.
 *
 * The bug: CountriesMap was inserting every taxonomy country into countryData,
 * defaulting missing facet data to 0. This prevented THEME.noData from being
 * applied and corrupted the legend with artificial zero values.
 *
 * The fix: Only add countries to countryData when they are present in facet.tags.
 * Use `products == null` to distinguish missing from explicit zero.
 */

describe('CountriesMap buildCountryData', () => {
	it('should only include countries present in facet.tags, not all taxonomy countries', () => {
		// Simulate taxonomy with 3 countries
		const taxo: Taxonomy<Country> = {
			'en:united-states': {
				name: { en: 'United States' },
				country_code_3: { en: 'USA' },
				country_code_2: { en: 'US' }
			},
			'en:france': {
				name: { en: 'France' },
				country_code_3: { en: 'FRA' },
				country_code_2: { en: 'FR' }
			},
			'en:germany': {
				name: { en: 'Germany' },
				country_code_3: { en: 'DEU' },
				country_code_2: { en: 'DE' }
			}
		};

		// Simulate facet data with only 1 country
		const facetTags = [{ id: 'en:united-states', products: 100 }];

		// Use the actual production function
		const countryData = buildCountryData(taxo, facetTags);

		// Assert: Only the country present in facet.tags should be in countryData
		expect(countryData.size).toBe(1);
		expect(countryData.has('840')).toBe(true); // USA numeric ID
		expect(countryData.get('840')?.products).toBe(100);
		expect(countryData.has('250')).toBe(false); // France numeric ID
		expect(countryData.has('276')).toBe(false); // Germany numeric ID
	});

	it('should preserve explicit zero product counts from facet.tags', () => {
		const taxo: Taxonomy<Country> = {
			'en:united-states': {
				name: { en: 'United States' },
				country_code_3: { en: 'USA' },
				country_code_2: { en: 'US' }
			},
			'en:france': {
				name: { en: 'France' },
				country_code_3: { en: 'FRA' },
				country_code_2: { en: 'FR' }
			}
		};

		// Facet data includes a country with explicit zero products
		const facetTags = [
			{ id: 'en:united-states', products: 100 },
			{ id: 'en:france', products: 0 }
		];

		const countryData = buildCountryData(taxo, facetTags);

		// Assert: Both countries should be present, including the one with 0 products
		expect(countryData.size).toBe(2);
		expect(countryData.get('840')?.products).toBe(100);
		expect(countryData.get('250')?.products).toBe(0);
	});

	it('should not introduce artificial zero values into legend calculations', () => {
		const taxo: Taxonomy<Country> = {
			'en:united-states': {
				name: { en: 'United States' },
				country_code_3: { en: 'USA' },
				country_code_2: { en: 'US' }
			},
			'en:france': {
				name: { en: 'France' },
				country_code_3: { en: 'FRA' },
				country_code_2: { en: 'FR' }
			},
			'en:germany': {
				name: { en: 'Germany' },
				country_code_3: { en: 'DEU' },
				country_code_2: { en: 'DE' }
			}
		};

		// Facet data has only positive counts
		const facetTags = [
			{ id: 'en:united-states', products: 100 },
			{ id: 'en:france', products: 50 }
		];

		const countryData = buildCountryData(taxo, facetTags);

		// Calculate min/max as done in the legend
		const minVal = Math.min(...[...countryData.values()].map((d: { products: number }) => d.products));
		const maxVal = Math.max(...[...countryData.values()].map((d: { products: number }) => d.products));

		// Assert: Min should be 50 (from actual facet data), not 0 (from missing countries)
		expect(minVal).toBe(50);
		expect(maxVal).toBe(100);
	});

	it('should distinguish between missing data and explicit zero', () => {
		const taxo: Taxonomy<Country> = {
			'en:united-states': {
				name: { en: 'United States' },
				country_code_3: { en: 'USA' },
				country_code_2: { en: 'US' }
			},
			'en:france': {
				name: { en: 'France' },
				country_code_3: { en: 'FRA' },
				country_code_2: { en: 'FR' }
			}
		};

		// Only one country in facet data with explicit zero
		const facetTags = [{ id: 'en:united-states', products: 0 }];

		const countryData = buildCountryData(taxo, facetTags);

		// Assert: Explicit 0 should be preserved, missing country should be absent
		expect(countryData.size).toBe(1);
		expect(countryData.get('840')?.products).toBe(0);
		expect(countryData.has('250')).toBe(false);
	});

	it('should handle empty facet tags', () => {
		const taxo: Taxonomy<Country> = {
			'en:united-states': {
				name: { en: 'United States' },
				country_code_3: { en: 'USA' },
				country_code_2: { en: 'US' }
			}
		};

		const countryData = buildCountryData(taxo, []);

		// Assert: No countries should be in countryData when facet tags are empty
		expect(countryData.size).toBe(0);
	});
});
