import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { compareStore, MAX_COMPARE_PRODUCTS } from './compareStore.js';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

describe('compareStore', () => {
	beforeEach(() => {
		compareStore.clear();
	});

	const createProduct = (code: string, name = `Product ${code}`): Product => {
		return {
			code,
			product_name: name
		} as unknown as Product;
	};

	it('starts empty', () => {
		expect(get(compareStore)).toEqual([]);
	});

	it('adds products up to MAX_COMPARE_PRODUCTS (4)', () => {
		const p1 = createProduct('001');
		const p2 = createProduct('002');
		const p3 = createProduct('003');
		const p4 = createProduct('004');
		const p5 = createProduct('005');

		expect(compareStore.addProduct(p1)).toBe(true);
		expect(compareStore.addProduct(p2)).toBe(true);
		expect(compareStore.addProduct(p3)).toBe(true);
		expect(compareStore.addProduct(p4)).toBe(true);
		expect(get(compareStore).length).toBe(MAX_COMPARE_PRODUCTS);

		// Exceeding 4 products should return false and not add
		expect(compareStore.addProduct(p5)).toBe(false);
		expect(get(compareStore).length).toBe(MAX_COMPARE_PRODUCTS);
	});

	it('prevents adding products with empty, missing, or whitespace-only barcodes', () => {
		expect(compareStore.addProduct(createProduct(''))).toBe(false);
		expect(compareStore.addProduct(createProduct('   '))).toBe(false);
		expect(compareStore.addProduct({ product_name: 'No Code' } as unknown as Product)).toBe(false);
		expect(get(compareStore).length).toBe(0);
	});

	it('prevents adding duplicate products with the same code (including trimmed)', () => {
		const p1 = createProduct('001');
		const p1WithSpaces = createProduct('  001  ');
		expect(compareStore.addProduct(p1)).toBe(true);
		expect(compareStore.addProduct(p1)).toBe(false);
		expect(compareStore.addProduct(p1WithSpaces)).toBe(false);
		expect(get(compareStore).length).toBe(1);
	});

	it('removes a product by barcode (including with whitespace)', () => {
		const p1 = createProduct('001');
		const p2 = createProduct('002');
		compareStore.addProduct(p1);
		compareStore.addProduct(p2);
		expect(get(compareStore).length).toBe(2);

		compareStore.removeProduct(' 001 ');
		const current = get(compareStore);
		expect(current.length).toBe(1);
		expect(current[0].code).toBe('002');
	});

	it('reorders products correctly', () => {
		const p1 = createProduct('001');
		const p2 = createProduct('002');
		const p3 = createProduct('003');
		compareStore.addProduct(p1);
		compareStore.addProduct(p2);
		compareStore.addProduct(p3);

		// Move product at index 2 (003) to index 0
		compareStore.reorder(2, 0);
		const current = get(compareStore);
		expect(current.map((p) => p.code)).toEqual(['003', '001', '002']);
	});

	it('clears all products', () => {
		compareStore.addProduct(createProduct('001'));
		compareStore.addProduct(createProduct('002'));
		expect(get(compareStore).length).toBe(2);

		compareStore.clear();
		expect(get(compareStore)).toEqual([]);
	});
});
