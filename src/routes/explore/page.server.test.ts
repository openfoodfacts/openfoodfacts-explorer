import { describe, expect, it, vi } from 'vitest';
import { load } from './+page.server';

vi.mock('$app/env/public', () => ({ PUBLIC_QUERY_BASE_URL: 'https://query.example.org' }));

describe('Explore Query loader', () => {
	it('requests popular barcodes by category and isolates failures', async () => {
		const fetch = vi.fn(async (request: Request) => {
			const body = await request.clone().json();
			if (body.filter.categories_tags === 'en:snacks') {
				return Response.json([{ code: '123', scans_n: 42 }, { code: '456' }, { scans_n: 5 }]);
			}
			if (body.filter.categories_tags === 'en:beverages') {
				return new Response(null, { status: 503 });
			}
			return Response.json([]);
		});
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const result = await load({ fetch } as unknown as Parameters<typeof load>[0]);

		expect(fetch).toHaveBeenCalledTimes(10);
		expect(fetch.mock.calls[0][0].signal).toBeInstanceOf(AbortSignal);
		if (!result) throw new Error('Expected Query results');
		expect(result.querySections?.[0]).toEqual({
			category: 'Snacks',
			products: [{ code: '123', scans_n: 42 }, { code: '456' }]
		});
		expect(result.querySections?.[1]).toBeNull();
		const body = await fetch.mock.calls[0][0].clone().json();
		expect(body).toMatchObject({
			filter: { categories_tags: 'en:snacks' },
			projection: { code: true, scans_n: true },
			sort: [['popularity_key', -1]],
			limit: 6
		});
		consoleError.mockRestore();
	});
	it('isolates an aborted category request', async () => {
		const timeout = vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => AbortSignal.abort());
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const fetch = vi.fn(async (request: Request) => {
			const body = await request.clone().json();
			if (body.filter.categories_tags === 'en:snacks') throw request.signal.reason;
			return Response.json([{ code: '123' }]);
		});
		const result = await load({ fetch } as unknown as Parameters<typeof load>[0]);
		expect(result?.querySections?.[0]).toBeNull();
		expect(result?.querySections?.[1]?.products).toEqual([{ code: '123' }]);
		expect(timeout).toHaveBeenCalledWith(5000);
		timeout.mockRestore();
		consoleError.mockRestore();
	});
});
