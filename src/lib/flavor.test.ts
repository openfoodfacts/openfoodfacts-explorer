import { describe, expect, it } from 'vitest';
import { getWebsiteFlavorFromParam, isCosmeticProduct, toWebsiteFlavor } from './flavor';

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
