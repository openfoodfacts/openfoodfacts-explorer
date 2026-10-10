import { describe, expect, it } from 'vitest';
import {
	extractProductSources,
	getSourceForField,
	isSafeSourceUrl,
	type ProductWithSources
} from './sources';

describe('isSafeSourceUrl', () => {
	it('accepts valid http and https URLs', () => {
		expect(isSafeSourceUrl('https://example.com')).toBe(true);
		expect(isSafeSourceUrl('http://example.org/path?query=1')).toBe(true);
	});

	it('rejects unsafe schemes and malformed URLs', () => {
		expect(isSafeSourceUrl('javascript:alert(1)')).toBe(false);
		expect(isSafeSourceUrl('data:text/html,test')).toBe(false);
		expect(isSafeSourceUrl('ftp://example.com')).toBe(false);
		expect(isSafeSourceUrl('not a url')).toBe(false);
		expect(isSafeSourceUrl('')).toBe(false);
		expect(isSafeSourceUrl(null)).toBe(false);
		expect(isSafeSourceUrl(undefined)).toBe(false);
	});
});

describe('extractProductSources', () => {
	it('returns empty array when product is undefined or has no sources', () => {
		expect(extractProductSources(undefined)).toEqual([]);
		expect(extractProductSources(null)).toEqual([]);
		expect(extractProductSources({})).toEqual([]);
		expect(extractProductSources({ sources: [] })).toEqual([]);
	});

	it('extracts sources from product.sources array', () => {
		const product: ProductWithSources = {
			sources: [
				{ id: 'usda', name: 'USDA FoodData Central', fields: ['ingredients', 'nutriments'] },
				{ id: 'openfood-ch', name: 'FoodRepo', url: 'https://foodrepo.org' }
			]
		};

		const result = extractProductSources(product);
		expect(result).toHaveLength(2);
		expect(result[0].id).toBe('usda');
		expect(result[1].name).toBe('FoodRepo');
	});

	it('extracts source from legacy single product.source object', () => {
		const product: ProductWithSources = {
			source: { id: 'producer', name: 'Manufacturer Portal' }
		};

		const result = extractProductSources(product);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe('producer');
	});

	it('deduplicates when source is present in both sources array and source object', () => {
		const product: ProductWithSources = {
			sources: [{ id: 'usda', name: 'USDA FoodData Central' }],
			source: { id: 'usda', name: 'USDA FoodData Central' }
		};

		const result = extractProductSources(product);
		expect(result).toHaveLength(1);
	});

	it('merges fields and retains latest metadata from repeated imports with the same source ID', () => {
		const product: ProductWithSources = {
			sources: [
				{
					id: 'usda',
					name: 'USDA Old',
					import_t: 100,
					url: 'https://old.usda.gov',
					fields: ['brands']
				},
				{
					id: 'usda',
					name: 'USDA New',
					import_t: 200,
					url: 'https://new.usda.gov',
					fields: ['quantity']
				}
			]
		};

		const result = extractProductSources(product);
		expect(result).toHaveLength(1);
		expect(result[0].fields).toEqual(['brands', 'quantity']);
		expect(result[0].name).toBe('USDA New');
		expect(result[0].import_t).toBe(200);
		expect(result[0].url).toBe('https://new.usda.gov');
		expect(getSourceForField(product, 'brands')?.id).toBe('usda');
		expect(getSourceForField(product, 'quantity')?.id).toBe('usda');
	});
});

describe('getSourceForField', () => {
	it('returns undefined if product has no sources or field not found', () => {
		expect(getSourceForField(undefined, 'product_name')).toBeUndefined();
		expect(getSourceForField({}, 'product_name')).toBeUndefined();
		expect(
			getSourceForField({ sources: [{ id: 'usda', fields: ['ingredients'] }] }, 'product_name')
		).toBeUndefined();
	});

	it('matches exact field name in source fields array', () => {
		const product: ProductWithSources = {
			sources: [
				{ id: 'usda', name: 'USDA', fields: ['ingredients_text', 'nutrition_data'] },
				{ id: 'producer', name: 'Producer', fields: ['product_name', 'brands'] }
			]
		};

		const source = getSourceForField(product, 'product_name');
		expect(source).toBeDefined();
		expect(source?.id).toBe('producer');
	});

	it('matches normalized tag fields (e.g. categories_tags vs categories)', () => {
		const product: ProductWithSources = {
			sources: [{ id: 'producer', name: 'Producer', fields: ['categories'] }]
		};

		const source = getSourceForField(product, 'categories_tags');
		expect(source).toBeDefined();
		expect(source?.id).toBe('producer');
	});

	it('selects the latest import when two imports modify the same field', () => {
		const product: ProductWithSources = {
			sources: [
				{ id: 'source-old', name: 'First Importer', fields: ['brands'] },
				{ id: 'source-new', name: 'Latest Importer', fields: ['brands'] }
			]
		};

		const source = getSourceForField(product, 'brands');
		expect(source).toBeDefined();
		expect(source?.id).toBe('source-new');
	});

	it('handles A-B-A import sequences attributing each field to its latest modifier', () => {
		const product: ProductWithSources = {
			sources: [
				{ id: 'source-a', name: 'Source A First', fields: ['brands'] },
				{ id: 'source-b', name: 'Source B', fields: ['brands', 'quantity'] },
				{ id: 'source-a', name: 'Source A Second', fields: ['categories'] }
			]
		};

		// 'brands' was modified by A first, then overwritten by B
		expect(getSourceForField(product, 'brands')?.id).toBe('source-b');
		// 'quantity' was supplied by B
		expect(getSourceForField(product, 'quantity')?.id).toBe('source-b');
		// 'categories' was supplied by A in the latest import
		expect(getSourceForField(product, 'categories')?.id).toBe('source-a');
	});

	it('does not invent attribution if source has no fields array', () => {
		const product: ProductWithSources = {
			source: { id: 'single-source', name: 'Complete Import' }
		};

		const source = getSourceForField(product, 'any_field');
		expect(source).toBeUndefined();
	});
});
