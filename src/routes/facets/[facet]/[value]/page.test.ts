import { isHttpError } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import { FacetHttpError, getFacetKnowledgePanels, getFacetValue } from '#lib/api/facets.js';
import { load } from './+page';

vi.mock('#lib/api/facets.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('#lib/api/facets.js')>();
	return {
		...actual,
		getFacetValue: vi.fn(),
		getFacetKnowledgePanels: vi.fn()
	};
});

const baseUrl = new URL('http://localhost/world-en/facets/brands/zzqqxx-not-a-brand');
const searchOptions = { page: 1, pageSize: 50, sortBy: undefined };

describe('facet value page loader', () => {
	it('throws 404 when getFacetValue throws a 404 FacetHttpError', async () => {
		vi.mocked(getFacetKnowledgePanels).mockResolvedValue({ knowledge_panels: {} });
		vi.mocked(getFacetValue).mockRejectedValue(new FacetHttpError(404, 'Not Found'));

		try {
			await load({
				fetch,
				params: { facet: 'notafacet', value: 'xyz' },
				url: new URL('http://localhost/world-en/facets/notafacet/xyz'),
				data: { queryProducts: null, mapValues: null, searchOptions }
			} as unknown as Parameters<typeof load>[0]);
			expect.unreachable('Expected load to throw 404');
		} catch (e) {
			expect(isHttpError(e, 404)).toBe(true);
		}
	});

	it('throws 404 when Query returns count 0', async () => {
		vi.mocked(getFacetKnowledgePanels).mockResolvedValue({ knowledge_panels: {} });

		try {
			await load({
				fetch,
				params: { facet: 'brands', value: 'zzqqxx-not-a-brand' },
				url: baseUrl,
				data: {
					queryProducts: { products: [], count: 0, page: 1, page_size: 50, page_count: 0 },
					mapValues: null,
					searchOptions
				}
			} as unknown as Parameters<typeof load>[0]);
			expect.unreachable('Expected load to throw 404');
		} catch (e) {
			expect(isHttpError(e, 404)).toBe(true);
		}
	});

	it('keeps returning empty results when Product Opener returns a tag list without products', async () => {
		vi.mocked(getFacetKnowledgePanels).mockResolvedValue({ knowledge_panels: {} });
		vi.mocked(getFacetValue).mockResolvedValue({ count: 4, tags: [] } as never);

		const result = await load({
			fetch,
			params: { facet: 'nova-groups', value: '4' },
			url: new URL('http://localhost/world-en/facets/nova-groups/4'),
			data: { queryProducts: null, mapValues: null, searchOptions }
		} as unknown as Parameters<typeof load>[0]);

		expect(result?.results.products).toEqual([]);
		expect(result?.results.count).toBe(0);
	});

	it('throws 500 on genuine upstream failures instead of returning 200 or 404', async () => {
		vi.mocked(getFacetKnowledgePanels).mockResolvedValue({ knowledge_panels: {} });
		vi.mocked(getFacetValue).mockRejectedValue(new FacetHttpError(429, 'Too Many Requests'));

		try {
			await load({
				fetch,
				params: { facet: 'contributors', value: 'some-user' },
				url: new URL('http://localhost/world-en/facets/contributors/some-user'),
				data: { queryProducts: null, mapValues: null, searchOptions }
			} as unknown as Parameters<typeof load>[0]);
			expect.unreachable('Expected load to throw 500');
		} catch (e) {
			expect(isHttpError(e, 500)).toBe(true);
		}
	});

	it('does not return 404 for out-of-range pagination when count > 0', async () => {
		vi.mocked(getFacetKnowledgePanels).mockResolvedValue({ knowledge_panels: {} });

		const result = await load({
			fetch,
			params: { facet: 'brands', value: 'nutella' },
			url: new URL('http://localhost/world-en/facets/brands/nutella?page=9999'),
			data: {
				queryProducts: { products: [], count: 500, page: 9999, page_size: 50, page_count: 0 },
				mapValues: null,
				searchOptions: { page: 9999, pageSize: 50, sortBy: undefined }
			}
		} as unknown as Parameters<typeof load>[0]);

		expect(result?.results.count).toBe(500);
		expect(result?.results.products).toEqual([]);
	});
});
