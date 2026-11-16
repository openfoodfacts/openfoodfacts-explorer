import { describe, expect, it } from 'vitest';
import { getFacetPairs, getFacetPairsPath } from './facets';

describe('getFacetPairs', () => {
	it('returns one pair for a single facet page', () => {
		expect(getFacetPairs('brands', 'ferrero', '')).toEqual([{ facet: 'brands', value: 'ferrero' }]);
	});

	it('adds a pair for each facet and value in the rest of the path', () => {
		expect(getFacetPairs('brands', 'ferrero', 'categories/en:spreads/labels/en:organic')).toEqual([
			{ facet: 'brands', value: 'ferrero' },
			{ facet: 'categories', value: 'en:spreads' },
			{ facet: 'labels', value: 'en:organic' }
		]);
	});

	it.each([
		['a facet without a value', 'categories'],
		['an empty part', 'categories//labels/en:organic'],
		['a trailing slash', 'categories/en:spreads/'],
		['a repeated facet', 'brands/nutella']
	])('rejects %s', (_, rest) => {
		expect(getFacetPairs('brands', 'ferrero', rest)).toBeNull();
	});
});

describe('getFacetPairsPath', () => {
	it('builds the page path from the pairs', () => {
		expect(
			getFacetPairsPath([
				{ facet: 'brands', value: 'ferrero' },
				{ facet: 'categories', value: 'en:spreads' }
			])
		).toBe('/facets/brands/ferrero/categories/en:spreads');
	});
});
