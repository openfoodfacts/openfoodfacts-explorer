import { describe, expect, it } from 'vitest';
import {
	getWebsiteFlavorFromParam,
	isCosmeticProduct,
	toWebsiteFlavor,
	updateProductType
} from './flavor';

describe('toWebsiteFlavor', () => {
	it('maps known product types to their website flavor', () => {
		expect(toWebsiteFlavor('food')).toBe('food');
		expect(toWebsiteFlavor('beauty')).toBe('beauty');
		expect(toWebsiteFlavor('petfood')).toBe('petfood');
		expect(toWebsiteFlavor('product')).toBe('product');
	});

	it('falls back to food for unknown or empty product types', () => {
		expect(toWebsiteFlavor('unknown')).toBe('food');
		expect(toWebsiteFlavor('all')).toBe('food');
		expect(toWebsiteFlavor('')).toBe('food');
	});

	it('maps Open X Facts aliases to website flavors', () => {
		expect(toWebsiteFlavor('off')).toBe('food');
		expect(toWebsiteFlavor('obf')).toBe('beauty');
		expect(toWebsiteFlavor('opff')).toBe('petfood');
		expect(toWebsiteFlavor('opf')).toBe('product');
	});

	it('returns no flavor for an unknown query parameter', () => {
		expect(getWebsiteFlavorFromParam(null)).toBeUndefined();
		expect(getWebsiteFlavorFromParam('unknown')).toBeUndefined();
		expect(getWebsiteFlavorFromParam(' OBF ')).toBe('beauty');
	});
});

describe('isCosmeticProduct', () => {
	it('identifies cosmetic and beauty product types', () => {
		expect(isCosmeticProduct('beauty')).toBe(true);
		expect(isCosmeticProduct('obf')).toBe(true);
		expect(isCosmeticProduct('cosmetic')).toBe(true);
		expect(isCosmeticProduct('cosmetics')).toBe(true);
		expect(isCosmeticProduct(' BEAUTY ')).toBe(true);
	});

	it('returns false for non-cosmetic product types', () => {
		expect(isCosmeticProduct('food')).toBe(false);
		expect(isCosmeticProduct('petfood')).toBe(false);
		expect(isCosmeticProduct('product')).toBe(false);
		expect(isCosmeticProduct('unknown')).toBe(false);
		expect(isCosmeticProduct('')).toBe(false);
		expect(isCosmeticProduct(null)).toBe(false);
		expect(isCosmeticProduct(undefined)).toBe(false);
	});
});

describe('updateProductType', () => {
	it('sets no_nutrition_data to true when switching from food to beauty', () => {
		const initial = { product_type: 'food', no_nutrition_data: false, product_name: 'Cookie' };
		const updated = updateProductType(initial, 'beauty');

		expect(updated.product_type).toBe('beauty');
		expect(updated.no_nutrition_data).toBe(true);
		expect(updated.product_name).toBe('Cookie');
	});

	it('clears no_nutrition_data to false when switching from beauty to food', () => {
		const initial = { product_type: 'beauty', no_nutrition_data: true, product_name: 'Shampoo' };
		const updated = updateProductType(initial, 'food');

		expect(updated.product_type).toBe('food');
		expect(updated.no_nutrition_data).toBe(false);
		expect(updated.product_name).toBe('Shampoo');
	});

	it('clears no_nutrition_data to false when switching from obf to petfood', () => {
		const initial = { product_type: 'obf', no_nutrition_data: true };
		const updated = updateProductType(initial, 'petfood');

		expect(updated.product_type).toBe('petfood');
		expect(updated.no_nutrition_data).toBe(false);
	});

	it('preserves existing no_nutrition_data when switching between non-cosmetic types', () => {
		const withNutrition = { product_type: 'food', no_nutrition_data: false };
		expect(updateProductType(withNutrition, 'petfood')).toEqual({
			product_type: 'petfood',
			no_nutrition_data: false
		});

		const withoutNutrition = { product_type: 'food', no_nutrition_data: true };
		expect(updateProductType(withoutNutrition, 'petfood')).toEqual({
			product_type: 'petfood',
			no_nutrition_data: true
		});
	});

	it('sets no_nutrition_data to true when setting beauty on an empty product', () => {
		const initial = {};
		const updated = updateProductType(initial, 'beauty');

		expect(updated.product_type).toBe('beauty');
		expect(updated.no_nutrition_data).toBe(true);
	});

	it('leaves no_nutrition_data unchanged when setting food on an empty product', () => {
		const initial = {};
		const updated = updateProductType(initial, 'food');

		expect(updated.product_type).toBe('food');
		expect(updated.no_nutrition_data).toBeUndefined();
	});
});
