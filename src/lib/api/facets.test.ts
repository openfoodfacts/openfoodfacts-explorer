import { describe, expect, it, vi } from 'vitest';
import { getFacetPairs, getFacetPairsPath, getProductsForFacetFilter } from './facets';

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
		).toBe('/facets/brands/ferrero/categories/en%3Aspreads');
	});

	it('encodes values that would break the path', () => {
		expect(getFacetPairsPath([{ facet: 'brands', value: 'ferrero#special' }])).toBe(
			'/facets/brands/ferrero%23special'
		);
	});
});

describe('getProductsForFacetFilter', () => {
	const sortOf = async (sortBy?: 'popularity') => {
		const fetch = vi.fn(async () => Response.json({ products: [], count: 0 }));
		await getProductsForFacetFilter(
			fetch,
			{ brands_tags: 'ferrero', categories_tags: 'en:spreads' },
			{ page: 1, pageSize: 10, sortBy }
		);
		const input = (fetch.mock.calls as unknown[][])[0][0];
		const url = new URL(input instanceof Request ? input.url : String(input));
		return url.searchParams.get('sort_by');
	};

	it('sorts by last modified date when no sort is chosen', async () => {
		expect(await sortOf()).toBe('last_modified_t');
	});

	it('keeps the chosen sort', async () => {
		expect(await sortOf('popularity')).toBe('popularity');
	});
});
