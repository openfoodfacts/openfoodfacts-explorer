import { describe, expect, it, vi } from 'vitest';
import { getFacetValue } from '#lib/api/facets.js';
import { getHierarchy, sortChildren } from './hierarchy';

vi.mock('#lib/api/facets.js', () => ({ getFacetValue: vi.fn() }));

// Like the real API, names come back only in the languages asked for with lc (English if none).
type Entry = { name?: Record<string, string>; parents?: string[]; children?: string[] };

const taxoFetch = (taxo: Record<string, Entry>) =>
	vi.fn(async (url: RequestInfo | URL) => {
		const langs = (new URL(String(url)).searchParams.get('lc') ?? 'en').split(',');
		const filtered = Object.fromEntries(
			Object.entries(taxo).map(([id, entry]) => [
				id,
				{
					...entry,
					name: Object.fromEntries(
						Object.entries(entry.name ?? {}).filter(([l]) => langs.includes(l))
					)
				}
			])
		);
		return { ok: true, json: async () => filtered } as unknown as Response;
	});

describe('sortChildren', () => {
	it('puts the largest first, drops empty ones and keeps unknown counts last by name', () => {
		const sorted = sortChildren([
			{ id: 'a', name: 'Bran', count: 10 },
			{ id: 'b', name: 'Mueslis', count: 8600 },
			{ id: 'c', name: 'Empty', count: 0 },
			{ id: 'd', name: 'Zeta' },
			{ id: 'e', name: 'Alpha' }
		]);
		expect(sorted.map((c) => c.name)).toEqual(['Mueslis', 'Bran', 'Alpha', 'Zeta']);
	});
});

describe('getHierarchy', () => {
	it('counts children when there are 30 or fewer, in the visitor language', async () => {
		vi.mocked(getFacetValue).mockReset();
		vi.mocked(getFacetValue).mockImplementation(async (_f, _facet, id) => {
			if (id === 'en:broken') throw new Error('503');
			return { count: id === 'en:mueslis' ? 8600 : 12 } as never;
		});
		const fetch = taxoFetch({
			'en:cereals': {
				name: { en: 'Cereals', fr: 'Céréales' },
				parents: ['en:plant-based'],
				children: ['en:flakes', 'en:mueslis', 'en:broken']
			},
			'en:plant-based': { name: { en: 'Plant-based' } },
			'en:flakes': { name: { en: 'Flakes', fr: 'Flocons' } },
			'en:mueslis': { name: { en: 'Mueslis' } },
			'en:broken': { name: { en: 'Broken' } }
		});

		const h = await getHierarchy(fetch, 'categories', 'en:cereals', 'fr-FR');

		expect(h.parents).toEqual([{ id: 'en:plant-based', name: 'Plant-based' }]);
		expect(h.children.map((c) => [c.name, c.count])).toEqual([
			['Mueslis', 8600],
			['Flocons', 12],
			['Broken', undefined]
		]);
	});

	it('skips the count requests and sorts by name above 30 children', async () => {
		vi.mocked(getFacetValue).mockReset();
		const ids = Array.from({ length: 31 }, (_, i) => `en:c${String(30 - i).padStart(2, '0')}`);
		const taxo: Record<string, Entry> = { 'en:wines': { children: ids } };
		ids.forEach((id) => (taxo[id] = { name: { en: id.slice(3) } }));

		const h = await getHierarchy(taxoFetch(taxo), 'categories', 'en:wines', 'en');

		expect(getFacetValue).not.toHaveBeenCalled();
		expect(h.children).toHaveLength(31);
		expect(h.children[0].name).toBe('c00');
	});

	it('throws on a failed taxonomy response', async () => {
		const fetch = vi.fn(async () => ({ ok: false, status: 400 }) as unknown as Response);
		await expect(getHierarchy(fetch, 'brands', 'x', 'en')).rejects.toThrow('400');
	});
});
