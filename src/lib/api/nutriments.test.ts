import { describe, it, expect } from 'vitest';
import { REFERENCE_INTAKES, calculateNutrientPercentage } from './nutriments';

describe('REFERENCE_INTAKES', () => {
	it('has correct EU reference intake values for core nutrients', () => {
		expect(REFERENCE_INTAKES.fat).toBe(70);
		expect(REFERENCE_INTAKES['saturated-fat']).toBe(20);
		expect(REFERENCE_INTAKES.sugars).toBe(90);
		expect(REFERENCE_INTAKES.salt).toBe(6);
	});
});

describe('calculateNutrientPercentage', () => {
	it('calculates 50% for half the reference value of fat', () => {
		expect(calculateNutrientPercentage(35, 'fat')).toBe(50);
	});

	it('calculates 50% for half the reference value of salt', () => {
		expect(calculateNutrientPercentage(3, 'salt')).toBe(50);
	});

	it('returns 0% for zero values', () => {
		expect(calculateNutrientPercentage(0, 'sugars')).toBe(0);
	});

	it('returns > 100% for values exceeding the reference', () => {
		expect(calculateNutrientPercentage(90, 'sugars')).toBe(100);
		expect(calculateNutrientPercentage(100, 'sugars')).toBeGreaterThan(100);
	});
});
