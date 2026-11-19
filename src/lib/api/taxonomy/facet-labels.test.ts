import { describe, expect, it, vi } from 'vitest';
import { getFacetLabel, getFacetLabelEntry } from './facet-labels';

describe('facet display labels', () => {
	it('uses a localized taxonomy label and falls back to English', async () => {
		const fetch = vi
			.fn<typeof globalThis.fetch>()
			.mockResolvedValue(
				Response.json({ 'en:fruit-juices': { name: { en: 'Fruit juices', fr: 'Jus de fruits' } } })
			);

		const entries = await getFacetLabelEntry(fetch, 'categories', 'en:fruit-juices', 'fr');

		expect(getFacetLabel('en:fruit-juices', entries, 'fr')).toBe('Jus de fruits');
		expect(getFacetLabel('en:fruit-juices', entries, 'de')).toBe('Fruit juices');
	});

	it('uses a readable label for an unknown taxonomy tag', () => {
		expect(getFacetLabel('en:unknown-tag', undefined, 'en')).toBe('unknown tag');
	});

	it('skips the taxonomy request for non-taxonomy facets', async () => {
		const fetch = vi.fn<typeof globalThis.fetch>();

		expect(await getFacetLabelEntry(fetch, 'brands', 'acme', 'en')).toBeUndefined();
		expect(fetch).not.toHaveBeenCalled();
	});
});
