import { describe, expect, it } from 'vitest';

import { toWebsiteFlavor, WEBSITE_FLAVOR_METADATA } from './flavor';

describe('toWebsiteFlavor', () => {
	it('maps known product types to their website flavor', () => {
		expect(toWebsiteFlavor('food')).toBe('food');
		expect(toWebsiteFlavor('beauty')).toBe('beauty');
		expect(toWebsiteFlavor('petfood')).toBe('petfood');
		expect(toWebsiteFlavor('product')).toBe('product');
	});

	it('falls back to food for unknown or empty product types', () => {
		expect(toWebsiteFlavor(undefined)).toBe('food');
		expect(toWebsiteFlavor(null)).toBe('food');
		expect(toWebsiteFlavor('all')).toBe('food');
		expect(toWebsiteFlavor('')).toBe('food');
	});
});

describe('WEBSITE_FLAVOR_METADATA', () => {
	it('contains the expected public hosts', () => {
		expect(WEBSITE_FLAVOR_METADATA.food.apiBaseUrl).toContain('openfoodfacts');
		expect(WEBSITE_FLAVOR_METADATA.beauty.apiBaseUrl).toContain('openbeautyfacts');
		expect(WEBSITE_FLAVOR_METADATA.petfood.apiBaseUrl).toContain('openpetfoodfacts');
		expect(WEBSITE_FLAVOR_METADATA.product.apiBaseUrl).toContain('openproductsfacts');
	});
});
