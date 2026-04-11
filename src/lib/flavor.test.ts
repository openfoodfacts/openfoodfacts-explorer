import { describe, expect, it } from 'vitest';
import { toWebsiteFlavor } from './flavor';

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
});
