import { isHttpError } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import { queryFacetProducts } from '#lib/server/query-facet-products.js';
import { queryAllFacetValues } from '#lib/server/query-facets.js';
import { load } from './+page.server';

vi.mock('#lib/server/query-facet-products.js', () => ({
	queryFacetProducts: vi.fn()
}));

vi.mock('#lib/server/query-facets.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('#lib/server/query-facets.js')>();
	return {
		...actual,
		queryAllFacetValues: vi.fn()
	};
});

describe('facet value server loader', () => {
	it('throws 404 when Query API returns count === 0', async () => {
		vi.mocked(queryFacetProducts).mockResolvedValue({
			products: [],
			count: 0,
			page: 1,
			page_size: 50,
			page_count: 0
		});
		vi.mocked(queryAllFacetValues).mockResolvedValue(null);

		try {
			await load({
				fetch,
				params: { facet: 'brands', value: 'zzqqxx-not-a-brand' },
				url: new URL('http://localhost/world-en/facets/brands/zzqqxx-not-a-brand')
			} as unknown as Parameters<typeof load>[0]);
			expect.unreachable('Expected load to throw 404');
		} catch (e) {
			expect(isHttpError(e, 404)).toBe(true);
		}
	});

	it('does not throw 404 for out-of-range pagination when count > 0', async () => {
		vi.mocked(queryFacetProducts).mockResolvedValue({
			products: [],
			count: 500,
			page: 9999,
			page_size: 50,
			page_count: 0
		});
		vi.mocked(queryAllFacetValues).mockResolvedValue(null);

		const result = await load({
			fetch,
			params: { facet: 'brands', value: 'nutella' },
			url: new URL('http://localhost/world-en/facets/brands/nutella?page=9999')
		} as unknown as Parameters<typeof load>[0]);

		expect(result?.queryProducts?.count).toBe(500);
		expect(result?.queryProducts?.products).toEqual([]);
	});

	it('returns null queryProducts for non-Query facets', async () => {
		vi.mocked(queryFacetProducts).mockResolvedValue(null);
		vi.mocked(queryAllFacetValues).mockResolvedValue(null);

		const result = await load({
			fetch,
			params: { facet: 'contributors', value: 'some-user' },
			url: new URL('http://localhost/world-en/facets/contributors/some-user')
		} as unknown as Parameters<typeof load>[0]);

		if (!result) throw new Error('Expected load result');
		expect(result.queryProducts).toBeNull();
	});

	it('preserves 400 validation for invalid page and sort_by', async () => {
		try {
			await load({
				fetch,
				params: { facet: 'brands', value: 'nutella' },
				url: new URL('http://localhost/world-en/facets/brands/nutella?page=0')
			} as unknown as Parameters<typeof load>[0]);
			expect.unreachable('Expected load to throw 400');
		} catch (e) {
			expect(isHttpError(e, 400)).toBe(true);
		}

		try {
			await load({
				fetch,
				params: { facet: 'brands', value: 'nutella' },
				url: new URL('http://localhost/world-en/facets/brands/nutella?sort_by=invalid')
			} as unknown as Parameters<typeof load>[0]);
			expect.unreachable('Expected load to throw 400');
		} catch (e) {
			expect(isHttpError(e, 400)).toBe(true);
		}
	});
});
