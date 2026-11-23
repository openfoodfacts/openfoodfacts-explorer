import { describe, it, expect } from 'vitest';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
import {
	getNutrientValue,
	getBestValue,
	getWorstValue,
	calculatePercentageDiff,
	formatNutrient,
	getScoreComparison,
	getNovaComparison,
	getNutrientComparison,
	getDiffColorClass,
	getDirection
} from './comparisonUtils.js';

describe('comparisonUtils', () => {
	const createMockProduct = (overrides: Record<string, unknown> = {}): Product => {
		return {
			code: '12345',
			product_name: 'Test Product',
			...overrides
		} as unknown as Product;
	};

	describe('getNutrientValue', () => {
		it('extracts number values directly', () => {
			const product = createMockProduct({
				nutriments: { 'energy-kcal_100g': 250 }
			});
			expect(getNutrientValue(product, 'energy-kcal_100g')).toBe(250);
		});

		it('parses string values if numeric', () => {
			const product = createMockProduct({
				nutriments: { fat_100g: '12.5' as unknown as number }
			});
			expect(getNutrientValue(product, 'fat_100g')).toBe(12.5);
		});

		it('returns null for missing nutriments or non-numeric strings', () => {
			const product1 = createMockProduct();
			expect(getNutrientValue(product1, 'fat_100g')).toBeNull();

			const product2 = createMockProduct({
				nutriments: { fat_100g: 'invalid' as unknown as number }
			});
			expect(getNutrientValue(product2, 'fat_100g')).toBeNull();
		});

		it('returns null for NaN values', () => {
			const product = createMockProduct({
				nutriments: { fat_100g: NaN }
			});
			expect(getNutrientValue(product, 'fat_100g')).toBeNull();
		});
	});

	describe('getDirection', () => {
		it('returns max for beneficial nutrients (protein, fiber, fruits/veg)', () => {
			expect(getDirection('proteins_100g')).toBe('max');
			expect(getDirection('fibers_100g')).toBe('max');
			expect(getDirection('fruits-vegetables-nuts-estimate-from-ingredients_100g')).toBe('max');
		});

		it('returns min for nutrients to limit (sugar, salt, fat, calories)', () => {
			expect(getDirection('sugars_100g')).toBe('min');
			expect(getDirection('salt_100g')).toBe('min');
			expect(getDirection('fat_100g')).toBe('min');
			expect(getDirection('energy-kcal_100g')).toBe('min');
		});

		it('defaults to min for unknown nutrients', () => {
			expect(getDirection('unknown_nutrient')).toBe('min');
		});
	});

	describe('getBestValue & getWorstValue', () => {
		const products = [
			createMockProduct({
				code: '1',
				nutriments: { sugars_100g: 5, proteins_100g: 10 }
			}),
			createMockProduct({
				code: '2',
				nutriments: { sugars_100g: 15, proteins_100g: 2 }
			}),
			createMockProduct({
				code: '3',
				nutriments: { sugars_100g: 25, proteins_100g: 20 }
			}),
			createMockProduct({
				code: '4',
				nutriments: {}
			})
		];

		it('calculates best value according to nutrient direction', () => {
			// For sugars, min is best -> 5
			expect(getBestValue(products, 'sugars_100g')).toBe(5);
			// For proteins, max is best -> 20
			expect(getBestValue(products, 'proteins_100g')).toBe(20);
		});

		it('calculates worst value according to nutrient direction', () => {
			// For sugars, max is worst -> 25
			expect(getWorstValue(products, 'sugars_100g')).toBe(25);
			// For proteins, min is worst -> 2
			expect(getWorstValue(products, 'proteins_100g')).toBe(2);
		});

		it('handles products with missing values gracefully without failing', () => {
			const emptyProducts = [createMockProduct(), createMockProduct()];
			expect(getBestValue(emptyProducts, 'fat_100g')).toBeNull();
			expect(getWorstValue(emptyProducts, 'fat_100g')).toBeNull();
		});
	});

	describe('calculatePercentageDiff', () => {
		it('calculates positive and negative percentage differences', () => {
			expect(calculatePercentageDiff(150, 100)).toBe(50);
			expect(calculatePercentageDiff(50, 100)).toBe(-50);
			expect(calculatePercentageDiff(100, 100)).toBe(0);
		});

		it('handles division by zero and invalid values safely', () => {
			expect(calculatePercentageDiff(100, 0)).toBe(0);
			expect(calculatePercentageDiff(NaN, 100)).toBe(0);
			expect(calculatePercentageDiff(100, NaN)).toBe(0);
		});
	});

	describe('formatNutrient', () => {
		it('formats null/undefined/NaN as hyphen', () => {
			expect(formatNutrient(null)).toBe('-');
			expect(formatNutrient(undefined)).toBe('-');
			expect(formatNutrient(NaN)).toBe('-');
		});

		it('formats decimals and integers correctly', () => {
			expect(formatNutrient(12.345, true)).toBe('12.3');
			expect(formatNutrient(12.345, false)).toBe('12');
		});
	});

	describe('getScoreComparison', () => {
		const products = [
			createMockProduct({ code: '1', nutriscore_grade: 'a', ecoscore_grade: 'b' }),
			createMockProduct({ code: '2', nutriscore_grade: 'c', ecoscore_grade: 'd' }),
			createMockProduct({ code: '3', nutriscore_grade: 'e', ecoscore_grade: 'f' }),
			createMockProduct({ code: '4', nutriscore_grade: 'unknown' as unknown as string })
		];

		it('identifies best and worst Nutri-Score grades', () => {
			expect(getScoreComparison('a', products, 'nutriscore')).toEqual({
				isBest: true,
				isWorst: false
			});
			expect(getScoreComparison('c', products, 'nutriscore')).toEqual({
				isBest: false,
				isWorst: false
			});
			expect(getScoreComparison('e', products, 'nutriscore')).toEqual({
				isBest: false,
				isWorst: true
			});
		});

		it('does not corrupt best score when an invalid/unknown grade exists', () => {
			// Product 4 has 'unknown', which indexOf returns -1 for.
			// Product 1 ('a') should still be best!
			const res = getScoreComparison('a', products, 'nutriscore');
			expect(res.isBest).toBe(true);
		});

		it('handles Eco-Score grade f properly', () => {
			const resF = getScoreComparison('f', products, 'ecoscore');
			expect(resF.isWorst).toBe(true);
			expect(resF.isBest).toBe(false);

			const resB = getScoreComparison('b', products, 'ecoscore');
			expect(resB.isBest).toBe(true);
			expect(resB.isWorst).toBe(false);
		});

		it('returns neither best nor worst when all products have identical scores', () => {
			const identical = [
				createMockProduct({ code: '1', nutriscore_grade: 'b' }),
				createMockProduct({ code: '2', nutriscore_grade: 'b' })
			];
			expect(getScoreComparison('b', identical, 'nutriscore')).toEqual({
				isBest: false,
				isWorst: false
			});
		});

		it('handles single product comparisons gracefully', () => {
			const single = [createMockProduct({ code: '1', nutriscore_grade: 'a' })];
			expect(getScoreComparison('a', single, 'nutriscore')).toEqual({
				isBest: false,
				isWorst: false
			});
		});
	});

	describe('getNovaComparison', () => {
		const products = [
			createMockProduct({ code: '1', nova_group: 1 }),
			createMockProduct({ code: '2', nova_group: 3 }),
			createMockProduct({ code: '3', nova_group: '4' as unknown as number }),
			createMockProduct({ code: '4', nova_group: 'unknown' as unknown as number })
		];

		it('identifies lowest Nova group as best and highest as worst', () => {
			expect(getNovaComparison(1, products)).toEqual({
				isBest: true,
				isWorst: false
			});
			expect(getNovaComparison(3, products)).toEqual({
				isBest: false,
				isWorst: false
			});
			expect(getNovaComparison(4, products)).toEqual({
				isBest: false,
				isWorst: true
			});
		});

		it('handles string representations of numbers correctly', () => {
			expect(getNovaComparison('1', products)).toEqual({
				isBest: true,
				isWorst: false
			});
			expect(getNovaComparison('4', products)).toEqual({
				isBest: false,
				isWorst: true
			});
		});

		it('handles unknown and invalid groups gracefully', () => {
			expect(getNovaComparison('unknown', products)).toEqual({
				isBest: false,
				isWorst: false
			});
			expect(getNovaComparison(null, products)).toEqual({
				isBest: false,
				isWorst: false
			});
		});
	});

	describe('getNutrientComparison across comparison modes', () => {
		const products = [
			createMockProduct({
				code: '1',
				nutriments: { sugars_100g: 10 }
			}),
			createMockProduct({
				code: '2',
				nutriments: { sugars_100g: 20 }
			}),
			createMockProduct({
				code: '3',
				nutriments: { sugars_100g: 5 }
			}),
			createMockProduct({
				code: '4',
				nutriments: {}
			})
		];

		it('supports absolute comparison mode (no percentage diff)', () => {
			const comp = getNutrientComparison(products[1], 'sugars_100g', products, 1, 'absolute');
			expect(comp.value).toBe(20);
			expect(comp.diff).toBeNull();
			expect(comp.diffFormatted).toBe('');
		});

		it('supports relative-first comparison mode (relative to product index 0)', () => {
			// Product 0 has sugars = 10
			// Product 1 has sugars = 20 -> +100%
			const comp1 = getNutrientComparison(
				products[1],
				'sugars_100g',
				products,
				1,
				'relative-first'
			);
			expect(comp1.diff).toBe(100);
			expect(comp1.diffFormatted).toBe('+100%');

			// Product 0 relative to itself has no diff
			const comp0 = getNutrientComparison(
				products[0],
				'sugars_100g',
				products,
				0,
				'relative-first'
			);
			expect(comp0.diff).toBeNull();
			expect(comp0.diffFormatted).toBe('');
		});

		it('supports relative-best comparison mode (relative to best product value)', () => {
			// Best sugars is product 2 (value: 5)
			// Product 0 (value: 10) compared to best 5 -> +100%
			const comp0 = getNutrientComparison(products[0], 'sugars_100g', products, 0, 'relative-best');
			expect(comp0.diff).toBe(100);
			expect(comp0.diffFormatted).toBe('+100%');

			// Product 2 (value: 5) is the best, diff against itself is null
			const comp2 = getNutrientComparison(products[2], 'sugars_100g', products, 2, 'relative-best');
			expect(comp2.isBest).toBe(true);
			expect(comp2.diff).toBeNull();
		});

		it('identifies best and worst nutrient values correctly', () => {
			// Sugar min is best -> product 2 (5g) is best, product 1 (20g) is worst
			const compBest = getNutrientComparison(products[2], 'sugars_100g', products, 2, 'absolute');
			expect(compBest.isBest).toBe(true);
			expect(compBest.isWorst).toBe(false);

			const compWorst = getNutrientComparison(products[1], 'sugars_100g', products, 1, 'absolute');
			expect(compWorst.isBest).toBe(false);
			expect(compWorst.isWorst).toBe(true);
		});

		it('handles missing product nutrient gracefully without throwing', () => {
			const compMissing = getNutrientComparison(
				products[3],
				'sugars_100g',
				products,
				3,
				'relative-best'
			);
			expect(compMissing.value).toBeNull();
			expect(compMissing.formatted).toBe('-');
			expect(compMissing.isBest).toBe(false);
			expect(compMissing.isWorst).toBe(false);
		});
	});

	describe('getDiffColorClass', () => {
		it('returns text-success font-semibold for best value', () => {
			expect(getDiffColorClass(null, true, false, 'sugars_100g')).toBe(
				'text-success font-semibold'
			);
		});

		it('returns text-error for worst value', () => {
			expect(getDiffColorClass(null, false, true, 'sugars_100g')).toBe('text-error');
		});

		it('returns text-success for lower values of nutrients to minimize', () => {
			expect(getDiffColorClass(-20, false, false, 'sugars_100g')).toBe('text-success');
			expect(getDiffColorClass(20, false, false, 'sugars_100g')).toBe('text-warning');
		});

		it('returns text-success for higher values of beneficial nutrients', () => {
			expect(getDiffColorClass(20, false, false, 'proteins_100g')).toBe('text-success');
			expect(getDiffColorClass(-20, false, false, 'proteins_100g')).toBe('text-warning');
		});
	});
});
