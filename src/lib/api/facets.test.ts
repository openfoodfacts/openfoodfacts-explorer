import { describe, expect, it, vi } from 'vitest';
import {
	getFacetDrilldown,
	getFacetForPairs,
	getFacetPairs,
	getFacetPairsPath,
	getProductsForFacetFilter
} from './facets';

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

describe('getFacetDrilldown', () => {
	it('lists a facet for the products of one value', () => {
		expect(getFacetDrilldown('brands', 'ferrero', 'categories')).toEqual({
			pairs: [{ facet: 'brands', value: 'ferrero' }],
			listFacet: 'categories'
		});
	});

	it('lists a facet for the products of several values', () => {
		expect(getFacetDrilldown('brands', 'ferrero', 'labels/en:organic/categories')).toEqual({
			pairs: [
				{ facet: 'brands', value: 'ferrero' },
				{ facet: 'labels', value: 'en:organic' }
			],
			listFacet: 'categories'
		});
	});

	it.each([
		['an empty path', ''],
		['an even path', 'categories/en:spreads'],
		['an empty part', 'labels//categories'],
		['a facet that is already filtered on', 'brands'],
		['a facet that is filtered on later in the path', 'labels/en:organic/labels']
	])('rejects %s', (_, path) => {
		expect(getFacetDrilldown('brands', 'ferrero', path)).toBeNull();
	});
});

describe('getFacetForPairs', () => {
	it('requests the facet list of the pairs from Product Opener', async () => {
		const fetch = vi.fn(async (..._: [RequestInfo | URL, RequestInit?]) =>
			Response.json({ count: 1, tags: [] })
		);
		const drilldown = {
			pairs: [
				{ facet: 'brands', value: 'ferrero' },
				{ facet: 'labels', value: 'en:organic' }
			],
			listFacet: 'categories'
		};

		const result = await getFacetForPairs(fetch, drilldown, { page: 2, pageSize: 10 });

		expect(result).toEqual({ count: 1, tags: [] });
		expect(String(fetch.mock.calls[0][0])).toMatch(
			/\/facets\/brands\/ferrero\/labels\/en%3Aorganic\/categories\.json\?page=2&page_size=10$/
		);
	});

	it('throws when Product Opener fails', async () => {
		const fetch = vi.fn(async () => new Response('', { status: 503 }));
		const drilldown = { pairs: [{ facet: 'brands', value: 'ferrero' }], listFacet: 'categories' };

		await expect(getFacetForPairs(fetch, drilldown, { page: 1, pageSize: 50 })).rejects.toThrow(
			'HTTP 503'
		);
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
