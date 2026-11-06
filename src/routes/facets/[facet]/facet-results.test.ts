import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getTaxo } from '#lib/api/taxonomy/api.js';
import { toFacetResults, toMapResults } from './facet-results';

vi.mock('#lib/api/taxonomy/api.js', () => ({ getTaxo: vi.fn() }));

beforeEach(() => vi.resetAllMocks());

describe('facet Query results', () => {
	it('localizes known tags and preserves counts', async () => {
		vi.mocked(getTaxo).mockResolvedValue({ 'en:france': { name: { fr: 'France' } } });
		const results = await toFacetResults(
			fetch,
			'countries',
			{
				count: 2,
				values: [
					{ _id: 'en:france', count: 42 },
					{ _id: 'en:other-country', count: 3 }
				]
			},
			'fr'
		);
		expect(results).toEqual({
			count: 2,
			tags: [
				{ id: 'en:france', name: 'France', known: 1, products: 42 },
				{ id: 'en:other-country', name: 'other country', known: 0, products: 3 }
			]
		});
	});

	it('handles unavailable taxonomies without marking values as unknown tags', async () => {
		vi.mocked(getTaxo).mockRejectedValue(new Error('unavailable'));
		const result = await toFacetResults(
			fetch,
			'categories',
			{ count: 1, values: [{ _id: 'en:dark-chocolate', count: 12 }] },
			'en'
		);
		expect(result.tags[0]).toEqual({
			id: 'en:dark-chocolate',
			name: 'dark chocolate',
			known: -1,
			products: 12
		});
	});

	it('keeps the unpaginated map counts', () => {
		expect(toMapResults([{ _id: 'en:france', count: 500 }])).toEqual({
			count: 1,
			tags: [{ id: 'en:france', name: 'en:france', known: 1, products: 500 }]
		});
	});
});
