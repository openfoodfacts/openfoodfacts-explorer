import { describe, expect, it, vi } from 'vitest';
import { FacetHttpError, getFacet, getFacetValue } from './facets';

describe('facets API helpers', () => {
	it('throws FacetHttpError with status when getFacet receives a 404 response', async () => {
		const fetch = vi.fn(
			async () => new Response('Not Found', { status: 404, statusText: 'Not Found' })
		);

		await expect(getFacet(fetch, 'notafacet')).rejects.toMatchObject({
			name: 'FacetHttpError',
			status: 404
		});
	});

	it('throws FacetHttpError with status when getFacetValue receives a 404 response', async () => {
		const fetch = vi.fn(
			async () => new Response('Not Found', { status: 404, statusText: 'Not Found' })
		);

		await expect(
			getFacetValue(fetch, 'brands', 'zzqqxx-not-a-brand', { page: 1, pageSize: 50 })
		).rejects.toBeInstanceOf(FacetHttpError);
	});

	it('returns JSON when the response is OK', async () => {
		const payload = {
			count: 1,
			tags: [{ id: 'en:france', name: 'France', known: 1, products: 10 }]
		};
		const fetch = vi.fn(async () => Response.json(payload));

		await expect(getFacet(fetch, 'countries')).resolves.toEqual(payload);
	});
});
