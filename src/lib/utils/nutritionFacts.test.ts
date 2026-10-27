import { describe, expect, it } from 'vitest';
import { hasNutritionFacts, isNutritionMissing, isValidNutrientNumber } from './nutritionFacts';

describe('nutritionFacts utility', () => {
	describe('isValidNutrientNumber', () => {
		it('returns true for numeric values including zero', () => {
			expect(isValidNutrientNumber(0)).toBe(true);
			expect(isValidNutrientNumber(10.5)).toBe(true);
			expect(isValidNutrientNumber(-1)).toBe(true);
		});

		it('returns true for numeric strings', () => {
			expect(isValidNutrientNumber('0')).toBe(true);
			expect(isValidNutrientNumber('42.5')).toBe(true);
		});

		it('returns false for invalid values', () => {
			expect(isValidNutrientNumber(NaN)).toBe(false);
			expect(isValidNutrientNumber(null)).toBe(false);
			expect(isValidNutrientNumber(undefined)).toBe(false);
			expect(isValidNutrientNumber('')).toBe(false);
			expect(isValidNutrientNumber('   ')).toBe(false);
			expect(isValidNutrientNumber('not-a-number')).toBe(false);
			expect(isValidNutrientNumber({})).toBe(false);
		});
	});

	describe('hasNutritionFacts', () => {
		it('returns false when product or nutriments is null/undefined', () => {
			expect(hasNutritionFacts(null)).toBe(false);
			expect(hasNutritionFacts(undefined)).toBe(false);
			expect(hasNutritionFacts({})).toBe(false);
			expect(hasNutritionFacts({ nutriments: null })).toBe(false);
			expect(hasNutritionFacts({ nutriments: {} })).toBe(false);
		});

		it('returns false for product 6111032006718 with only estimate fields (VaiTon review case)', () => {
			const productWithEstimatesOnly = {
				nutriments: {
					'added-sugars': 0,
					'added-sugars_100g': 0,
					'added-sugars_modifier': '~',
					'added-sugars_serving': 0,
					'added-sugars_unit': 'g',
					'added-sugars_value': 0,
					'fruits-vegetables-legumes-estimate-from-ingredients_100g': 0,
					'fruits-vegetables-nuts-estimate-from-ingredients_100g': 0
				}
			};

			expect(hasNutritionFacts(productWithEstimatesOnly)).toBe(false);
		});

		it('returns true when core nutrients are present', () => {
			expect(
				hasNutritionFacts({
					nutriments: {
						'energy-kcal_100g': 250,
						fat_100g: 12
					}
				})
			).toBe(true);

			expect(
				hasNutritionFacts({
					nutriments: {
						sugars_serving: 5
					}
				})
			).toBe(true);

			expect(
				hasNutritionFacts({
					nutriments: {
						proteins: 10
					}
				})
			).toBe(true);

			expect(
				hasNutritionFacts({
					nutriments: {
						salt_value: 0.5
					}
				})
			).toBe(true);
		});

		it('returns true when core nutrient is 0 (e.g. water or zero-calorie soda)', () => {
			expect(
				hasNutritionFacts({
					nutriments: {
						'energy-kcal_100g': 0,
						fat_100g: 0,
						proteins_100g: 0
					}
				})
			).toBe(true);
		});
	});

	describe('isNutritionMissing', () => {
		it('returns false when product or code is missing (prevents false positives during loading/error)', () => {
			expect(isNutritionMissing(null)).toBe(false);
			expect(isNutritionMissing(undefined)).toBe(false);
			expect(isNutritionMissing({})).toBe(false);
			expect(isNutritionMissing({ code: '' })).toBe(false);
		});

		it('returns true when nutrition facts are to be completed in states_tags', () => {
			expect(
				isNutritionMissing({
					code: '123456',
					states_tags: ['en:nutrition-facts-to-be-completed'],
					nutriments: {
						'energy-kcal_100g': 100
					}
				})
			).toBe(true);
		});

		it('returns true when product has code but no nutriments', () => {
			expect(
				isNutritionMissing({
					code: '123456',
					nutriments: {}
				})
			).toBe(true);

			expect(
				isNutritionMissing({
					code: '123456',
					nutriments: null
				})
			).toBe(true);
		});

		it('returns true for product 6111032006718 (Danette review case)', () => {
			expect(
				isNutritionMissing({
					code: '6111032006718',
					nutriments: {
						'added-sugars': 0,
						'added-sugars_100g': 0,
						'added-sugars_modifier': '~',
						'added-sugars_serving': 0,
						'added-sugars_unit': 'g',
						'added-sugars_value': 0,
						'fruits-vegetables-legumes-estimate-from-ingredients_100g': 0,
						'fruits-vegetables-nuts-estimate-from-ingredients_100g': 0
					}
				})
			).toBe(true);
		});

		it('returns false for complete products with real nutrients', () => {
			expect(
				isNutritionMissing({
					code: '5000112548167',
					nutriments: {
						'energy-kcal_100g': 42,
						sugars_100g: 10.6,
						salt_100g: 0
					}
				})
			).toBe(false);
		});
	});
});
