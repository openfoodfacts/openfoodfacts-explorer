import { describe, expect, it, vi } from 'vitest';
import { QUERY_FACETS, queryAllFacetValues, queryFacetCounts } from './query-facets';

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

	it('leaves unconfigured and unsupported facets on the existing path', async () => {
		const fetch = vi.fn();
		expect(await queryFacetCounts(fetch, '', 'categories', 1, 50)).toBeNull();
		expect(
			await queryFacetCounts(fetch, 'https://query.example', 'contributors', 1, 50)
		).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});
