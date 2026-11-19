import { describe, expect, it, vi } from 'vitest';
import { queryFacetProducts } from './query-facet-products';

describe('query facet products', () => {
	it.each([
		['popularity', 'popularity_key'],
		['nutriscore_score', 'nutriscore_score_opposite'],
		['environmental_score_score', 'environmental_score_score'],
		['created_t', 'created_t'],
		['last_modified_t', 'last_modified_t'],
		[undefined, 'last_modified_t']
	] as const)('maps sort option %s to %s', async (sortBy, expected) => {
		const fetch = vi.fn(async (request: RequestInfo | URL) =>
			Response.json(
				(request instanceof Request ? request.url : String(request)).endsWith('/count') ? 0 : []
			)
		);
		await queryFacetProducts(fetch, 'https://query.example', 'categories', 'en:teas', {
			page: 1,
			pageSize: 5,
			sortBy
		});
		expect((await (fetch.mock.calls[0][0] as Request).clone().json()).sort).toEqual([
			[expected, -1]
		]);
	});

	it('uses find and count, preserving pagination and sorting', async () => {
		const fetch = vi.fn(async (request: RequestInfo | URL) =>
			Response.json(
				(request instanceof Request ? request.url : String(request)).endsWith('/count')
					? 13
					: [{ code: '8718452537570' }]
			)
		);
		const result = await queryFacetProducts(
			fetch,
			'https://query.example',
			'categories',
			'en:teas',
			{ page: 2, pageSize: 5, sortBy: 'nutriscore_score' }
		);
		expect(result?.count).toBe(13);
		expect(result?.products[0].code).toBe('8718452537570');
		expect(await (fetch.mock.calls[0][0] as Request).clone().json()).toMatchObject({
			filter: { categories_tags: 'en:teas' },
			sort: [['nutriscore_score_opposite', -1]],
			limit: 5,
			skip: 5
		});
	});

	it('does not make a Query request when unconfigured or unsupported', async () => {
		const fetch = vi.fn();
		expect(
			await queryFacetProducts(fetch, '', 'categories', 'en:teas', { page: 1, pageSize: 5 })
		).toBeNull();
		expect(
			await queryFacetProducts(fetch, 'https://query.example', 'contributors', 'example', {
				page: 1,
				pageSize: 5
			})
		).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});
});
