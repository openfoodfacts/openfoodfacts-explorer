import { describe, expect, it, vi } from 'vitest';
import { getHierarchy } from './hierarchy';

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

describe('getHierarchy', () => {
	it('names parents and children in the visitor language, children sorted by name', async () => {
		const fetch = taxoFetch({
			'en:cereals': {
				name: { en: 'Cereals', fr: 'Céréales' },
				parents: ['en:plant-based'],
				children: ['en:mueslis', 'en:flakes', 'en:no-name']
			},
			'en:plant-based': { name: { en: 'Plant-based' } },
			'en:flakes': { name: { en: 'Flakes', fr: 'Flocons' } },
			'en:mueslis': { name: { en: 'Mueslis' } }
		});

		const h = await getHierarchy(fetch, 'categories', 'en:cereals', 'fr-FR');

		expect(fetch).toHaveBeenCalledOnce();
		expect(h.parents).toEqual([{ id: 'en:plant-based', name: 'Plant-based' }]);
		expect(h.children.map((c) => c.name)).toEqual(['en:no-name', 'Flocons', 'Mueslis']);
	});

	it('sorts children with the visitor language rules', async () => {
		const fetch = taxoFetch({
			'en:herbs': { children: ['en:a', 'en:b'] },
			'en:a': { name: { sv: 'Örter' } },
			'en:b': { name: { sv: 'Zebra' } }
		});

		const h = await getHierarchy(fetch, 'categories', 'en:herbs', 'sv-SE');

		expect(h.children.map((c) => c.name)).toEqual(['Zebra', 'Örter']);
	});

	it('throws on a failed taxonomy response', async () => {
		const fetch = vi.fn(async () => ({ ok: false, status: 400 }) as unknown as Response);
		await expect(getHierarchy(fetch, 'brands', 'x', 'en')).rejects.toThrow('400');
	});
});
