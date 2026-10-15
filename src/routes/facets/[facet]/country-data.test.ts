import { describe, expect, it } from 'vitest';
import type { Country, Taxonomy } from '@openfoodfacts/openfoodfacts-nodejs';
import { buildCountryData } from './country-data';

describe('buildCountryData', () => {
	it('only includes countries present in facet.tags', () => {
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

		const facetTags = [{ id: 'en:united-states', products: 100 }];
		const countryData = buildCountryData(taxo, facetTags);

		expect(countryData.size).toBe(1);
		expect(countryData.has('840')).toBe(true);
		expect(countryData.get('840')?.products).toBe(100);
		expect(countryData.has('250')).toBe(false);
		expect(countryData.has('276')).toBe(false);
	});

	it('preserves explicit zero product counts', () => {
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

		const facetTags = [
			{ id: 'en:united-states', products: 100 },
			{ id: 'en:france', products: 0 }
		];

		const countryData = buildCountryData(taxo, facetTags);

		expect(countryData.size).toBe(2);
		expect(countryData.get('840')?.products).toBe(100);
		expect(countryData.get('250')?.products).toBe(0);
	});

	it('does not introduce artificial zero values', () => {
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

		const facetTags = [
			{ id: 'en:united-states', products: 100 },
			{ id: 'en:france', products: 50 }
		];

		const countryData = buildCountryData(taxo, facetTags);

		const products = [...countryData.values()].map((d) => d.products);
		const minVal = Math.min(...products);
		const maxVal = Math.max(...products);

		expect(minVal).toBe(50);
		expect(maxVal).toBe(100);
	});

	it('distinguishes between missing data and explicit zero', () => {
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

		const facetTags = [{ id: 'en:united-states', products: 0 }];

		const countryData = buildCountryData(taxo, facetTags);

		expect(countryData.size).toBe(1);
		expect(countryData.get('840')?.products).toBe(0);
		expect(countryData.has('250')).toBe(false);
	});

	it('handles empty facet tags', () => {
		const taxo: Taxonomy<Country> = {
			'en:united-states': {
				name: { en: 'United States' },
				country_code_3: { en: 'USA' },
				country_code_2: { en: 'US' }
			}
		};

		const countryData = buildCountryData(taxo, []);

		expect(countryData.size).toBe(0);
	});
});
