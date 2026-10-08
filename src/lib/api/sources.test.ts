import { describe, expect, it } from 'vitest';
import { extractProductSources, getSourceForField, type ProductWithSources } from './sources';

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

	it('does not invent attribution if source has no fields array', () => {
		const product: ProductWithSources = {
			source: { id: 'single-source', name: 'Complete Import' }
		};

		const source = getSourceForField(product, 'any_field');
		expect(source).toBeUndefined();
	});
});
