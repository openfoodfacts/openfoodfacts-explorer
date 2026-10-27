import { describe, expect, it, vi } from 'vitest';
import { API_HOST } from '#lib/const.js';
import { filterFacet } from './facets';

const okResponse = (body: unknown) =>
	({ ok: true, json: () => Promise.resolve(body) }) as unknown as Response;

describe('filterFacet', () => {
	it('sends the filter and status to the facet endpoint', async () => {
		const body = { count: 10, tags: [{ id: 'en:apple', known: 1, name: 'Apple', products: 3 }] };
		const fetch = vi.fn().mockResolvedValue(okResponse(body));

		const result = await filterFacet(fetch, 'brands', { filter: 'apple', status: 'known' });

		expect(fetch).toHaveBeenCalledOnce();
		const url = new URL(fetch.mock.calls[0][0]);
		expect(`${url.origin}${url.pathname}`).toBe(`${API_HOST}/facets/brands.json`);
		expect(url.searchParams.get('filter')).toBe('apple');
		expect(url.searchParams.get('status')).toBe('known');
		expect(result).toEqual(body);
	});

	it('leaves out empty options', async () => {
		const fetch = vi.fn().mockResolvedValue(okResponse({ count: 0, tags: [] }));

		await filterFacet(fetch, 'ingredients', { status: 'unknown' });

		const url = new URL(fetch.mock.calls[0][0]);
		expect(url.searchParams.has('filter')).toBe(false);
		expect(url.searchParams.get('status')).toBe('unknown');
	});

	it('throws when the server fails, e.g. on a gateway timeout', async () => {
		const fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 504,
			statusText: 'Gateway Time-out'
		} as Response);

		await expect(filterFacet(fetch, 'ingredients', { filter: 'bon' })).rejects.toThrow('504');
	});
});
