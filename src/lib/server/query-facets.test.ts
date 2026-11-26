import { describe, expect, it, vi } from 'vitest';
import {
	getQueryFilter,
	isKnownFacet,
	QUERY_FACETS,
	queryAllFacetValues,
	queryFacetCounts,
	queryTopFacetValues
} from './query-facets';

describe('getQueryFilter', () => {
	it('builds one filter that matches every facet and value', () => {
		expect(
			getQueryFilter([
				{ facet: 'brands', value: 'ferrero' },
				{ facet: 'categories', value: 'en:spreads' }
			])
		).toEqual({ brands_tags: 'ferrero', categories_tags: 'en:spreads' });
	});

	it('returns null when a facet has no Query field', () => {
		expect(
			getQueryFilter([
				{ facet: 'brands', value: 'ferrero' },
				{ facet: 'contributors', value: 'example' }
			])
		).toBeNull();
	});
});

describe('isKnownFacet', () => {
	it('knows facets that have a Query field', () => {
		expect(isKnownFacet('categories')).toBe(true);
	});

	it('does not know other names', () => {
		expect(isKnownFacet('not-a-facet')).toBe(false);
		expect(isKnownFacet('toString')).toBe(false);
	});
});

describe('queryFacetCounts', () => {
	it('requests the entire distribution for a filtered facet', async () => {
		const fetch = vi.fn(async (..._: [RequestInfo | URL, RequestInit?]) =>
			Response.json([{ _id: 'en:france', count: 120 }])
		);
		await queryAllFacetValues(fetch, 'https://query.example', 'countries', {
			countries_tags: 'en:austria'
		});
		expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual([
			{ $match: { countries_tags: 'en:austria' } },
			{ $group: { _id: '$countries_tags' } }
		]);
	});
	it('maps each Query-supported facet to its indexed field', () => {
		expect(QUERY_FACETS).toMatchObject({
			brands: 'brands_tags',
			'nutrition-grades': 'nutrition_grades_tags',
			'environmental-score': 'ecoscore_tags',
			'packager-codes': 'emb_codes_tags',
			'data-sources': 'data_sources_tags',
			teams: 'teams_tags'
		});
	});
	it('uses aggregate for a page of values and its total', async () => {
		const fetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
			const stages = JSON.parse(String(init?.body));
			return Response.json(
				stages.some((stage: Record<string, unknown>) => '$count' in stage)
					? { categories_tags: 12 }
					: [{ _id: 'en:teas', count: 42 }]
			);
		});
		const result = await queryFacetCounts(fetch, 'https://query.example', 'categories', 2, 5);
		expect(result).toEqual({ values: [{ _id: 'en:teas', count: 42 }], count: 12 });
		expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual([
			{ $match: {} },
			{ $group: { _id: '$categories_tags' } },
			{ $skip: 5 },
			{ $limit: 5 }
		]);
	});

	it('counts only the values of products that match the filter', async () => {
		const fetch = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
			const stages = JSON.parse(String(init?.body));
			return Response.json(
				stages.some((stage: Record<string, unknown>) => '$count' in stage)
					? { categories_tags: 3 }
					: [{ _id: 'en:spreads', count: 7 }]
			);
		});
		const result = await queryFacetCounts(fetch, 'https://query.example', 'categories', 1, 50, {
			brands_tags: 'ferrero'
		});
		expect(result).toEqual({ values: [{ _id: 'en:spreads', count: 7 }], count: 3 });

		// Both the page of values and the total use the filter
		for (const call of fetch.mock.calls) {
			const stages = JSON.parse(String(call[1]?.body));
			expect(stages[0]).toEqual({ $match: { brands_tags: 'ferrero' } });
		}
	});

	it('leaves unconfigured and unsupported facets on the existing path', async () => {
		const fetch = vi.fn();
		expect(await queryFacetCounts(fetch, '', 'categories', 1, 50)).toBeNull();
		expect(
			await queryFacetCounts(fetch, 'https://query.example', 'contributors', 1, 50)
		).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe('queryTopFacetValues', () => {
	it('asks for the first values of the products that match the filter', async () => {
		const fetch = vi.fn<typeof globalThis.fetch>(async () =>
			Response.json([{ _id: 'en:italy', count: 9 }])
		);
		const result = await queryTopFacetValues(fetch, 'https://query.example', 'countries', 8, {
			brands_tags: 'ferrero'
		});
		expect(result).toEqual([{ _id: 'en:italy', count: 9 }]);
		expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toEqual([
			{ $match: { brands_tags: 'ferrero' } },
			{ $group: { _id: '$countries_tags' } },
			{ $skip: 0 },
			{ $limit: 8 }
		]);
	});

	it('returns null without a Query URL or a Query field', async () => {
		const fetch = vi.fn();
		expect(await queryTopFacetValues(fetch, '', 'countries', 8, {})).toBeNull();
		expect(
			await queryTopFacetValues(fetch, 'https://query.example', 'contributors', 8, {})
		).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});
