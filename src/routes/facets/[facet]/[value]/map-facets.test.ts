import { describe, expect, it } from 'vitest';
import { getFacetDistribution, queryValuesToDistribution } from './map-facets';

describe('queryValuesToDistribution', () => {
	it('preserves full-result counts and localizes names', () => {
		expect(
			queryValuesToDistribution(
				[
					{ _id: 'en:france', count: 250 },
					{ _id: 'en:italy', count: 30 }
				],
				{ 'en:france': { name: { fr: 'France' } } },
				'fr'
			)
		).toEqual({
			count: 2,
			tags: [
				{ id: 'en:france', products: 250, known: 1, name: 'France' },
				{ id: 'en:italy', products: 30, known: 1, name: 'en:italy' }
			]
		});
	});
});

describe('getFacetDistribution', () => {
	it('counts tags across products and localizes their names', () => {
		const taxonomy = {
			'en:france': { name: { en: 'France', fr: 'France' } },
			'en:italy': { name: { en: 'Italy', fr: 'Italie' } }
		};

		const result = getFacetDistribution(
			[{ origins_tags: ['en:france', 'en:italy'] }, { origins_tags: ['en:france'] }],
			'origins_tags',
			taxonomy,
			'fr'
		);

		expect(result).toEqual({
			count: 2,
			tags: [
				{ id: 'en:france', products: 2, known: 1, name: 'France' },
				{ id: 'en:italy', products: 1, known: 1, name: 'Italie' }
			]
		});
	});

	it('uses tag IDs when taxonomy names are unavailable', () => {
		const result = getFacetDistribution(
			[{ countries_tags: ['en:france'] }],
			'countries_tags',
			undefined,
			'en'
		);

		expect(result?.tags[0].name).toBe('en:france');
	});

	it('returns null when products have no usable tag arrays', () => {
		const result = getFacetDistribution(
			[{ origins_tags: 'en:france' }, { countries_tags: ['en:italy'] }],
			'origins_tags',
			undefined,
			'en'
		);

		expect(result).toBeNull();
	});
});
