import { describe, expect, it } from 'vitest';
import { facetPairsHref, searchWithoutPage } from './facet-links';

const pairs = [
	{ facet: 'brands', value: 'ferrero' },
	{ facet: 'labels', value: 'en:organic' }
];

describe('facetPairsHref', () => {
	it('links to the page of the pairs', () => {
		expect(facetPairsHref(pairs, '/facets/brands/ferrero')).toBe(
			'/facets/brands/ferrero/labels/en%3Aorganic'
		);
	});

	it('keeps the location prefix of the current page', () => {
		expect(facetPairsHref(pairs, '/fr-fr/facets/brands/ferrero')).toBe(
			'/fr-fr/facets/brands/ferrero/labels/en%3Aorganic'
		);
	});

	it('adds the listed facet and the query', () => {
		expect(
			facetPairsHref(pairs, '/world-en/facets/brands/ferrero', {
				listFacet: 'categories',
				query: '?page=2'
			})
		).toBe('/world-en/facets/brands/ferrero/labels/en%3Aorganic/categories?page=2');
	});
});

describe('searchWithoutPage', () => {
	it('keeps the search options without the page number', () => {
		expect(searchWithoutPage('?page=3&page_size=100&sort_by=nutriscore_score')).toBe(
			'?page_size=100&sort_by=nutriscore_score'
		);
	});

	it('returns an empty query when only the page number is set', () => {
		expect(searchWithoutPage('?page=3')).toBe('');
		expect(searchWithoutPage('')).toBe('');
	});
});
