import { describe, expect, it, vi } from 'vitest';
import { queryTopFacetValues } from '#lib/server/query-facets.js';
import { GET } from './+server';

vi.mock('$app/env/public', async (importOriginal) => {
	const original = await importOriginal<typeof import('$app/env/public')>();
	return { ...original, PUBLIC_QUERY_BASE_URL: 'https://query.example' };
});

vi.mock('#lib/server/query-facets.js', async (importOriginal) => {
	const original = await importOriginal<typeof import('#lib/server/query-facets.js')>();
	return { ...original, queryTopFacetValues: vi.fn() };
});

// Names come from the taxonomy in the app, here they are the ids
vi.mock('../../facets/[facet]/facet-results', () => ({
	toFacetResults: vi.fn(async (_fetch, _facet, results) => ({
		count: results.count,
		tags: results.values.map((value: { _id: string; count: number }) => ({
			id: value._id,
			name: value._id,
			products: value.count
		}))
	}))
}));

function callGet(search: string) {
	const url = new URL(`http://localhost/api/facet-slice?${search}`);
	return GET({ fetch: vi.fn(), url } as unknown as Parameters<typeof GET>[0]);
}

describe('GET /api/facet-slice', () => {
	it('returns the top values of the other facets, filtered by the page', async () => {
		vi.mocked(queryTopFacetValues).mockImplementation(async (_fetch, _url, facet) => {
			if (facet === 'countries') return [{ _id: 'en:italy', count: 9 }];
			return [];
		});

		const response = await callGet('path=brands/ferrero&lang=en');
		const body = await response.json();

		// Brands is already in the path, so it is not offered again
		const askedFacets = vi.mocked(queryTopFacetValues).mock.calls.map((call) => call[2]);
		expect(askedFacets).not.toContain('brands');
		expect(vi.mocked(queryTopFacetValues).mock.calls[0][4]).toEqual({ brands_tags: 'ferrero' });

		// Facets without values are left out
		expect(body).toEqual({
			groups: [{ facet: 'countries', tags: [{ id: 'en:italy', name: 'en:italy', products: 9 }] }]
		});
	});

	it('leaves out a facet whose request fails', async () => {
		vi.mocked(queryTopFacetValues).mockImplementation(async (_fetch, _url, facet) => {
			if (facet === 'labels') throw new Error('Query is down');
			return [{ _id: 'en:example', count: 1 }];
		});
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

		const response = await callGet('path=brands/ferrero');
		const body: { groups: { facet: string }[] } = await response.json();

		const facets = body.groups.map((group) => group.facet);
		expect(facets).not.toContain('labels');
		expect(facets).toContain('countries');
		consoleError.mockRestore();
	});

	it('rejects a path without a value', async () => {
		await expect(callGet('path=brands')).rejects.toMatchObject({ status: 400 });
	});

	it('returns 404 for a facet that Query does not know', async () => {
		await expect(callGet('path=contributors/example')).rejects.toMatchObject({ status: 404 });
	});
});
