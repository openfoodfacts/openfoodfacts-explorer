import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/public', () => ({
	ORIGIN: 'https://explorer.example.org',
	SEO_CANONICAL_TARGET: 'explorer'
}));
import { facetExplorerCanonicalUrl, facetOpenerCanonicalUrl, facetSeo } from './facet.js';

describe('Product Opener facet canonicals', () => {
	it.each([
		['world', 'en', 'world-en'],
		['FR', 'fr', 'fr-fr'],
		['GB', 'en', 'uk-en']
	])('maps %s and %s to the %s subdomain', (country, language, subdomain) => {
		expect(facetOpenerCanonicalUrl({ facet: 'categories' }, { country, language })).toBe(
			`https://${subdomain}.openfoodfacts.org/facets/categories`
		);
	});

	it('includes the encoded value and the page after the first', () => {
		const location = { country: 'world', language: 'en' };
		const facet = { facet: 'categories', value: 'en:pizzas' };
		expect(facetOpenerCanonicalUrl(facet, location)).toBe(
			'https://world-en.openfoodfacts.org/facets/categories/en%3Apizzas'
		);
		expect(facetOpenerCanonicalUrl(facet, location, 1)).not.toContain('page=');
		expect(facetOpenerCanonicalUrl(facet, location, 3)).toContain('?page=3');
	});
});

describe('Explorer facet canonicals', () => {
	const url = new URL('https://preview.example.org/world-fr/facets/brands/nestle');

	it('uses the configured origin and keeps the location segment', () => {
		expect(facetExplorerCanonicalUrl({ facet: 'brands' }, url)).toBe(
			'https://explorer.example.org/world-fr/facets/brands'
		);
		expect(facetExplorerCanonicalUrl({ facet: 'brands', value: 'nestle' }, url, 2)).toBe(
			'https://explorer.example.org/world-fr/facets/brands/nestle?page=2'
		);
	});

	it('uses the explorer target through facetSeo', () => {
		expect(facetSeo({ facet: 'brands', value: 'nestle' }, url).canonicalUrl).toBe(
			'https://explorer.example.org/world-fr/facets/brands/nestle'
		);
	});

	it('omits the canonical without a location segment', () => {
		expect(facetSeo({ facet: 'brands' }, new URL('https://example.org/facets/brands'))).toEqual({});
	});
});
