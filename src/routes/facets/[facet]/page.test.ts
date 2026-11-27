import { isHttpError } from '@sveltejs/kit';
import { describe, expect, it, vi } from 'vitest';
import { FacetHttpError, getFacet, getFacetKnowledgePanels } from '#lib/api/facets.js';
import { load } from './+page';

vi.mock('#lib/api/facets.js', async (importOriginal) => {
	const actual = await importOriginal<typeof import('#lib/api/facets.js')>();
	return {
		...actual,
		getFacet: vi.fn(),
		getFacetKnowledgePanels: vi.fn()
	};
});

describe('facet overview page loader', () => {
	it('throws 404 when getFacet throws a 404 FacetHttpError', async () => {
		vi.mocked(getFacetKnowledgePanels).mockResolvedValue({ knowledge_panels: {} });
		vi.mocked(getFacet).mockRejectedValue(new FacetHttpError(404, 'Not Found'));

		try {
			await load({
				fetch,
				params: { facet: 'notafacet' },
				url: new URL('http://localhost/facets/notafacet'),
				data: { queryResults: null, mapValues: null }
			} as unknown as Parameters<typeof load>[0]);
			expect.unreachable('Expected load to throw 404');
		} catch (e) {
			expect(isHttpError(e, 404)).toBe(true);
		}
	});

	it('throws 500 when getFacet fails with a non-404 error', async () => {
		vi.mocked(getFacetKnowledgePanels).mockResolvedValue({ knowledge_panels: {} });
		vi.mocked(getFacet).mockRejectedValue(new FacetHttpError(429, 'Too Many Requests'));

		try {
			await load({
				fetch,
				params: { facet: 'contributors' },
				url: new URL('http://localhost/facets/contributors'),
				data: { queryResults: null, mapValues: null }
			} as unknown as Parameters<typeof load>[0]);
			expect.unreachable('Expected load to throw 500');
		} catch (e) {
			expect(isHttpError(e, 500)).toBe(true);
		}
	});

	it('still loads a valid facet when knowledge panels fail', async () => {
		vi.mocked(getFacetKnowledgePanels).mockRejectedValue(new Error('KP unavailable'));
		vi.mocked(getFacet).mockResolvedValue({
			count: 1,
			tags: [{ id: 'user1', name: 'user1', known: 1, products: 5 }]
		});

		const result = await load({
			fetch,
			params: { facet: 'contributors' },
			url: new URL('http://localhost/facets/contributors'),
			data: { queryResults: null, mapValues: null }
		} as unknown as Parameters<typeof load>[0]);

		expect(result?.knowledgePanels).toEqual({});
		expect(result?.results.count).toBe(1);
	});
});
