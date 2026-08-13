import { describe, it, expect } from 'vitest';
import {
	parseLuceneFacets,
	toLuceneString,
	toggleExcludeFacet,
	toggleIncludeFacet
} from './facets';
import type { FacetsSelection } from './facets';

describe('toLuceneString', () => {
	it('handles empty query and empty facets', () => {
		const result = toLuceneString('', {});
		expect(result).toBe('');
	});

	it('handles only a text query without facets', () => {
		const result = toLuceneString('apple juice', {});
		expect(result).toBe('apple juice');
	});

	it('handles a single include facet without a query', () => {
		const facets: FacetsSelection = {
			brands: { include: ['Coca-Cola'], exclude: [] }
		};
		const result = toLuceneString('', facets);
		expect(result).toBe('brands:("Coca-Cola")');
	});

	it('handles a single exclude facet without a query', () => {
		const facets: FacetsSelection = {
			allergens: { include: [], exclude: ['en:peanuts'] }
		};
		const result = toLuceneString('', facets);
		expect(result).toBe('-allergens:("en:peanuts")');
	});

	it('handles multiple include values for the same facet', () => {
		const facets: FacetsSelection = {
			brands: { include: ['Coca-Cola', 'Pepsi'], exclude: [] }
		};
		const result = toLuceneString('', facets);
		expect(result).toBe('brands:("Coca-Cola" OR "Pepsi")');
	});

	it('handles multiple exclude values for the same facet', () => {
		const facets: FacetsSelection = {
			categories: { include: [], exclude: ['en:beverages', 'en:snacks'] }
		};
		const result = toLuceneString('', facets);
		expect(result).toBe('-categories:("en:beverages" OR "en:snacks")');
	});

	it('handles both include and exclude values for the same facet', () => {
		const facets: FacetsSelection = {
			categories: { include: ['en:beverages'], exclude: ['en:alcoholic-beverages'] }
		};
		const result = toLuceneString('', facets);
		expect(result).toBe('categories:("en:beverages") AND -categories:("en:alcoholic-beverages")');
	});

	it('handles multiple facet categories', () => {
		const facets: FacetsSelection = {
			brands: { include: ['Nestle'], exclude: [] },
			categories: { include: ['en:chocolates'], exclude: [] }
		};
		const result = toLuceneString('', facets);
		expect(result).toBe('brands:("Nestle") AND categories:("en:chocolates")');
	});

	it('handles a text query combined with facets', () => {
		const facets: FacetsSelection = {
			brands: { include: ['Lindt'], exclude: [] },
			labels: { include: [], exclude: ['en:organic'] }
		};
		const result = toLuceneString('dark chocolate', facets);
		expect(result).toBe('dark chocolate AND brands:("Lindt") AND -labels:("en:organic")');
	});

	it('handles empty include and exclude arrays gracefully', () => {
		const facets: FacetsSelection = {
			brands: { include: [], exclude: [] }
		};
		const result = toLuceneString('test', facets);
		expect(result).toBe('test');
	});
});

describe('parseLuceneFacets', () => {
	it('parses include and exclude facets from lucene string', () => {
		const query = 'categories:("en:beverages") AND -brands:("Coca-Cola" OR "Pepsi")';
		const parsed = parseLuceneFacets(query);
		expect(parsed).toEqual({
			categories: { include: ['en:beverages'], exclude: [] },
			brands: { include: [], exclude: ['Coca-Cola', 'Pepsi'] }
		});
	});
});

describe('toggleIncludeFacet & toggleExcludeFacet', () => {
	it('toggles include on and off', () => {
		let sel: FacetsSelection = {};
		sel = toggleIncludeFacet(sel, 'brands', 'Nestle');
		expect(sel.brands.include).toContain('Nestle');
		sel = toggleIncludeFacet(sel, 'brands', 'Nestle');
		expect(sel.brands.include).not.toContain('Nestle');
	});

	it('switches from exclude to include', () => {
		let sel: FacetsSelection = { brands: { include: [], exclude: ['Nestle'] } };
		sel = toggleIncludeFacet(sel, 'brands', 'Nestle');
		expect(sel.brands.include).toContain('Nestle');
		expect(sel.brands.exclude).not.toContain('Nestle');
	});

	it('toggles exclude on and off', () => {
		let sel: FacetsSelection = {};
		sel = toggleExcludeFacet(sel, 'brands', 'Coca-Cola');
		expect(sel.brands.exclude).toContain('Coca-Cola');
		sel = toggleExcludeFacet(sel, 'brands', 'Coca-Cola');
		expect(sel.brands.exclude).not.toContain('Coca-Cola');
	});
});
