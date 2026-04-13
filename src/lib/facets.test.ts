import { describe, it, expect } from 'vitest';
import { toLuceneString } from './facets';
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
