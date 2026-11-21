import { describe, expect, it, vi } from 'vitest';
import { load } from './+page.server';

vi.mock('$app/env/public', () => ({ PUBLIC_QUERY_BASE_URL: 'https://query.example.org' }));

describe('Explore Query loader', () => {
	it('requests popular barcodes by category and isolates failures', async () => {
		const fetch = vi.fn(async (request: Request) => {
			const body = await request.clone().json();
			if (body.filter.categories_tags === 'en:snacks') {
				return Response.json([{ code: '123', scans_n: 42 }]);
			}
			if (body.filter.categories_tags === 'en:beverages') {
				return new Response(null, { status: 503 });
			}
			return Response.json([]);
		});
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		const result = await load({ fetch } as unknown as Parameters<typeof load>[0]);

		expect(fetch).toHaveBeenCalledTimes(10);
		if (!result) throw new Error('Expected Query results');
		expect(result.querySections?.[0]).toEqual({
			category: 'Snacks',
			products: [{ code: '123', scans_n: 42 }]
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
});
