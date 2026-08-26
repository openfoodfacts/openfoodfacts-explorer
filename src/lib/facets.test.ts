import { describe, it, expect } from 'vitest';
import {
	parseLuceneFacets,
	toLuceneString,
	extractQuery,
	addIncludeFacet,
	addExcludeFacet,
	removeIncludeFacet,
	removeExcludeFacet,
	toggleExcludeFacet,
	toggleIncludeFacet,
	getSearchFieldForFacet,
	getFacetKeyForSearchField,
	groupCatalogFacets,
	MASTER_FACET_CATALOG
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

	it('preserves AND and OR operators inside quoted values', () => {
		const query =
			'categories:("Salt AND Vinegar" OR "Sweet OR Sour") AND -brands:("Ben & Jerry\'s")';
		const parsed = parseLuceneFacets(query);
		expect(parsed).toEqual({
			categories: { include: ['Salt AND Vinegar', 'Sweet OR Sour'], exclude: [] },
			brands: { include: [], exclude: ["Ben & Jerry's"] }
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

describe('search field mappings', () => {
	it('maps new facet keys to their respective search fields', () => {
		expect(getSearchFieldForFacet('packaging_shapes')).toBe('packagings.shape');
		expect(getSearchFieldForFacet('packaging_recycling')).toBe('packagings.recycling');
		expect(getSearchFieldForFacet('ingredients_analysis')).toBe('ingredients_analysis');
		expect(getSearchFieldForFacet('owner')).toBe('owner');
		expect(getSearchFieldForFacet('photographers')).toBe('photographers');
		expect(getSearchFieldForFacet('data_quality_warnings')).toBe('data_quality_warnings');
		expect(getSearchFieldForFacet('data_quality_errors')).toBe('data_quality_errors_tags');
		expect(getSearchFieldForFacet('popularity_tags')).toBe('popularity_tags');
	});

	it('maps search fields back to their respective facet keys', () => {
		expect(getFacetKeyForSearchField('packagings.shape')).toBe('packaging_shapes');
		expect(getFacetKeyForSearchField('packagings.recycling')).toBe('packaging_recycling');
		expect(getFacetKeyForSearchField('ingredients_analysis')).toBe('ingredients_analysis');
		expect(getFacetKeyForSearchField('owner')).toBe('owner');
		expect(getFacetKeyForSearchField('photographers')).toBe('photographers');
		expect(getFacetKeyForSearchField('data_quality_warnings')).toBe('data_quality_warnings');
		expect(getFacetKeyForSearchField('data_quality_errors_tags')).toBe('data_quality_errors');
		expect(getFacetKeyForSearchField('popularity_tags')).toBe('popularity_tags');
	});

	it('falls back to facetKey or searchField if not explicitly mapped', () => {
		expect(getSearchFieldForFacet('custom_field')).toBe('custom_field');
		expect(getFacetKeyForSearchField('custom_field')).toBe('custom_field');
	});

	it('correctly round-trips aliased facets through toLuceneString and parseLuceneFacets', () => {
		const selection: FacetsSelection = {
			packaging_shapes: {
				include: ['bottle', 'box'],
				exclude: ['can']
			}
		};
		const lucene = toLuceneString('', selection);
		expect(lucene).toBe('packagings.shape:("bottle" OR "box") AND -packagings.shape:("can")');
		const parsed = parseLuceneFacets(lucene);
		expect(parsed).toEqual(selection);
	});
});

describe('extractQuery', () => {
	it('extracts plain query text without facet terms', () => {
		expect(extractQuery('organic juice')).toBe('organic juice');
	});

	it('extracts query text from query with facet conditions', () => {
		expect(extractQuery('dark chocolate AND brands:("Lindt")')).toBe('dark chocolate');
	});

	it('returns empty string when query only contains facet filters', () => {
		expect(extractQuery('brands:("Coca-Cola") AND -categories:("en:sodas")')).toBe('');
	});
});

describe('add & remove facet helpers', () => {
	it('adds include facets without duplicates', () => {
		let sel: FacetsSelection = {};
		sel = addIncludeFacet(sel, 'brands', 'Nestle');
		expect(sel.brands.include).toEqual(['Nestle']);
		sel = addIncludeFacet(sel, 'brands', 'Nestle');
		expect(sel.brands.include).toEqual(['Nestle']);
		sel = addIncludeFacet(sel, 'brands', 'Danone');
		expect(sel.brands.include).toEqual(['Nestle', 'Danone']);
	});

	it('adds exclude facets without duplicates', () => {
		let sel: FacetsSelection = {};
		sel = addExcludeFacet(sel, 'allergens', 'en:peanuts');
		expect(sel.allergens.exclude).toEqual(['en:peanuts']);
		sel = addExcludeFacet(sel, 'allergens', 'en:peanuts');
		expect(sel.allergens.exclude).toEqual(['en:peanuts']);
	});

	it('removes include and exclude facets', () => {
		let sel: FacetsSelection = {
			brands: { include: ['Nestle', 'Danone'], exclude: ['Pepsi'] }
		};
		sel = removeIncludeFacet(sel, 'brands', 'Nestle');
		expect(sel.brands.include).toEqual(['Danone']);
		sel = removeExcludeFacet(sel, 'brands', 'Pepsi');
		expect(sel.brands.exclude).toEqual([]);
	});

	it('ensures include and exclude are mutually exclusive on add', () => {
		let sel: FacetsSelection = {
			ingredients: { include: ['water'], exclude: ['sugar'] }
		};
		sel = addIncludeFacet(sel, 'ingredients', 'sugar');
		expect(sel.ingredients.include).toEqual(['water', 'sugar']);
		expect(sel.ingredients.exclude).toEqual([]);

		sel = addExcludeFacet(sel, 'ingredients', 'water');
		expect(sel.ingredients.include).toEqual(['sugar']);
		expect(sel.ingredients.exclude).toEqual(['water']);
	});
});

describe('groupCatalogFacets', () => {
	it('correctly groups catalog items by their category', () => {
		const groups = groupCatalogFacets(MASTER_FACET_CATALOG);
		expect(groups['General']).toBeDefined();
		expect(groups['Nutrition & Health']).toBeDefined();
		expect(groups['Packaging & Origin']).toBeDefined();
		expect(groups['Community & Metadata']).toBeDefined();

		const totalGrouped = Object.values(groups).reduce((sum, items) => sum + items.length, 0);
		expect(totalGrouped).toBe(MASTER_FACET_CATALOG.length);
	});
});

describe('Facet serialization with special characters', () => {
	it('properly escapes and unescapes quotes and backslashes in facet values', () => {
		const selection = {
			origins: {
				include: ['France "Bio"', 'Region\\Area'],
				exclude: []
			}
		};
		const luceneStr = toLuceneString('pizza', selection);
		expect(luceneStr).toBe('pizza AND origins:("France \\"Bio\\"" OR "Region\\\\Area")');
		const parsed = parseLuceneFacets(luceneStr);
		expect(parsed.origins.include).toEqual(['France "Bio"', 'Region\\Area']);
	});
});
