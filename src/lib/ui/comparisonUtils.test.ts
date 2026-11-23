import { describe, it, expect, beforeEach } from 'vitest';
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
	getDirection,
	getProductKey,
	resetProductKeyCache,
	VALID_SCORE_GRADES,
	parseNovaGroup
} from './comparisonUtils.js';

describe('comparisonUtils', () => {
	const createMockProduct = (overrides: Record<string, unknown> = {}): Product => {
		return {
			code: '12345',
			product_name: 'Test Product',
			...overrides
		} as unknown as Product;
	};

	describe('getProductKey', () => {
		beforeEach(() => {
			resetProductKeyCache();
		});

		it('returns product code when present and non-empty', () => {
			const product = createMockProduct({ code: '3017620422003' });
			expect(getProductKey(product, 0)).toBe('3017620422003');
		});

		it('trims whitespace around product code', () => {
			const product = createMockProduct({ code: '  3017620422003  ' });
			expect(getProductKey(product, 0)).toBe('3017620422003');
		});

		it('returns unique fallback key for undefined, null, empty or whitespace-only code', () => {
			const emptyProd = createMockProduct({ code: '' });
			const wsProd = createMockProduct({ code: '   ' });
			const nullProd = createMockProduct({ code: null });
			const undefinedProd = createMockProduct({ code: undefined });

			const kEmpty = getProductKey(emptyProd, 0);
			const kWs = getProductKey(wsProd, 1);
			const kNull = getProductKey(nullProd, 2);
			const kUndef = getProductKey(undefinedProd, 3);

			expect(kEmpty).toMatch(/^__no_code_\d+$/);
			expect(kWs).toMatch(/^__no_code_\d+$/);
			expect(kNull).toMatch(/^__no_code_\d+$/);
			expect(kUndef).toMatch(/^__no_code_\d+$/);

			// All keys must be unique
			const allKeys = new Set([kEmpty, kWs, kNull, kUndef]);
			expect(allKeys.size).toBe(4);
		});

		it('disambiguates duplicate product codes across the list', () => {
			const p1 = createMockProduct({ code: '123' });
			const p2 = createMockProduct({ code: '123' });
			const p3 = createMockProduct({ code: '456' });
			const list = [p1, p2, p3];

			expect(getProductKey(p1, 0, list)).toBe('123');
			expect(getProductKey(p2, 1, list)).toBe('123__dup_1');
			expect(getProductKey(p3, 2, list)).toBe('456');
		});

		it('ensures keys remain strictly stable during reordering, removal, and insertion', () => {
			const pValid = createMockProduct({ code: 'valid-001' });
			const pDup = createMockProduct({ code: 'valid-001' });
			const pNoCode = createMockProduct({ code: '' });
			const pAnother = createMockProduct({ code: 'valid-002' });

			let list = [pValid, pDup, pNoCode];

			// Initial evaluation
			const keyValidInit = getProductKey(pValid, 0, list);
			const keyDupInit = getProductKey(pDup, 1, list);
			const keyNoCodeInit = getProductKey(pNoCode, 2, list);

			expect(keyValidInit).toBe('valid-001');
			expect(keyDupInit).toBe('valid-001__dup_1');
			expect(keyNoCodeInit).toBe('__no_code_1');

			// Reverse order (reordering simulation)
			list = [pNoCode, pDup, pValid];
			expect(getProductKey(pNoCode, 0, list)).toBe(keyNoCodeInit);
			expect(getProductKey(pDup, 1, list)).toBe(keyDupInit);
			expect(getProductKey(pValid, 2, list)).toBe(keyValidInit);

			// Insertion of another product at index 1
			list = [pNoCode, pAnother, pDup, pValid];
			expect(getProductKey(pAnother, 1, list)).toBe('valid-002');
			expect(getProductKey(pNoCode, 0, list)).toBe(keyNoCodeInit);
			expect(getProductKey(pDup, 2, list)).toBe(keyDupInit);
			expect(getProductKey(pValid, 3, list)).toBe(keyValidInit);

			// Removal of pDup
			list = [pNoCode, pAnother, pValid];
			expect(getProductKey(pNoCode, 0, list)).toBe(keyNoCodeInit);
			expect(getProductKey(pAnother, 1, list)).toBe('valid-002');
			expect(getProductKey(pValid, 2, list)).toBe(keyValidInit);
		});
	});

	describe('getNutrientValue', () => {
		it('extracts number values directly', () => {
			const product = createMockProduct({
				nutriments: { 'energy-kcal_100g': 250 }
			});
			expect(getNutrientValue(product, 'energy-kcal_100g')).toBe(250);
		});

		it('parses string values if numeric and trims whitespace', () => {
			const product = createMockProduct({
				nutriments: { fat_100g: ' 12.5 ' as unknown as number }
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

		it('returns null for NaN, Infinity, and -Infinity values', () => {
			expect(
				getNutrientValue(createMockProduct({ nutriments: { fat_100g: NaN } }), 'fat_100g')
			).toBeNull();
			expect(
				getNutrientValue(createMockProduct({ nutriments: { fat_100g: Infinity } }), 'fat_100g')
			).toBeNull();
			expect(
				getNutrientValue(createMockProduct({ nutriments: { fat_100g: -Infinity } }), 'fat_100g')
			).toBeNull();
			expect(
				getNutrientValue(
					createMockProduct({ nutriments: { fat_100g: 'Infinity' as unknown as number } }),
					'fat_100g'
				)
			).toBeNull();
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
				nutriments: { sugars_100g: NaN, proteins_100g: Infinity }
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

		it('handles division by zero and non-finite values safely', () => {
			expect(calculatePercentageDiff(100, 0)).toBe(0);
			expect(calculatePercentageDiff(NaN, 100)).toBe(0);
			expect(calculatePercentageDiff(100, NaN)).toBe(0);
			expect(calculatePercentageDiff(Infinity, 100)).toBe(0);
			expect(calculatePercentageDiff(100, Infinity)).toBe(0);
			expect(calculatePercentageDiff(-Infinity, 100)).toBe(0);
		});
	});

	describe('formatNutrient', () => {
		it('formats null/undefined/NaN/Infinity as hyphen', () => {
			expect(formatNutrient(null)).toBe('-');
			expect(formatNutrient(undefined)).toBe('-');
			expect(formatNutrient(NaN)).toBe('-');
			expect(formatNutrient(Infinity)).toBe('-');
			expect(formatNutrient(-Infinity)).toBe('-');
		});

		it('formats decimals and integers correctly', () => {
			expect(formatNutrient(12.345, true)).toBe('12.3');
			expect(formatNutrient(12.345, false)).toBe('12');
		});
	});

	describe('VALID_SCORE_GRADES & getScoreComparison', () => {
		it('contains exactly Open Food Facts supported grades A through E', () => {
			expect(VALID_SCORE_GRADES).toEqual(['a', 'b', 'c', 'd', 'e']);
		});

		const products = [
			createMockProduct({ code: '1', nutriscore_grade: 'a', ecoscore_grade: 'b' }),
			createMockProduct({ code: '2', nutriscore_grade: 'c', ecoscore_grade: 'd' }),
			createMockProduct({ code: '3', nutriscore_grade: 'e', ecoscore_grade: 'e' }),
			createMockProduct({
				code: '4',
				nutriscore_grade: 'unknown' as unknown as string,
				ecoscore_grade: 'f' as unknown as string
			})
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

		it('handles uppercase and whitespace around grade', () => {
			expect(getScoreComparison('  A  ', products, 'nutriscore')).toEqual({
				isBest: true,
				isWorst: false
			});
		});

		it('treats unsupported grade f or unknown as unranked without corrupting comparison', () => {
			// In OFF, Nutri-Score & Green-Score are A-E only.
			// Grade 'f' is unsupported and should return isBest: false, isWorst: false
			const resF = getScoreComparison('f', products, 'ecoscore');
			expect(resF.isBest).toBe(false);
			expect(resF.isWorst).toBe(false);

			// Product 1 with grade 'b' is the best among valid products
			const resB = getScoreComparison('b', products, 'ecoscore');
			expect(resB.isBest).toBe(true);
			expect(resB.isWorst).toBe(false);

			// Product 3 with grade 'e' is the worst among valid products
			const resE = getScoreComparison('e', products, 'ecoscore');
			expect(resE.isBest).toBe(false);
			expect(resE.isWorst).toBe(true);
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

		it('handles null, undefined or empty grades safely', () => {
			expect(getScoreComparison(null, products, 'nutriscore')).toEqual({
				isBest: false,
				isWorst: false
			});
			expect(getScoreComparison(undefined, products, 'nutriscore')).toEqual({
				isBest: false,
				isWorst: false
			});
			expect(getScoreComparison('', products, 'nutriscore')).toEqual({
				isBest: false,
				isWorst: false
			});
		});
	});

	describe('parseNovaGroup', () => {
		it('parses integers 1 to 4 correctly', () => {
			expect(parseNovaGroup(1)).toBe(1);
			expect(parseNovaGroup(2)).toBe(2);
			expect(parseNovaGroup(3)).toBe(3);
			expect(parseNovaGroup(4)).toBe(4);
		});

		it('parses numeric string representations 1 to 4 with whitespace trimming', () => {
			expect(parseNovaGroup('1')).toBe(1);
			expect(parseNovaGroup(' 2 ')).toBe(2);
			expect(parseNovaGroup('3')).toBe(3);
			expect(parseNovaGroup('4')).toBe(4);
		});

		it('rejects numbers outside range 1 to 4', () => {
			expect(parseNovaGroup(0)).toBeNull();
			expect(parseNovaGroup(5)).toBeNull();
			expect(parseNovaGroup(-1)).toBeNull();
			expect(parseNovaGroup('0')).toBeNull();
			expect(parseNovaGroup('5')).toBeNull();
		});

		it('rejects non-integer numbers, NaN, and non-numeric strings', () => {
			expect(parseNovaGroup(2.5)).toBeNull();
			expect(parseNovaGroup(NaN)).toBeNull();
			expect(parseNovaGroup('unknown')).toBeNull();
			expect(parseNovaGroup('')).toBeNull();
			expect(parseNovaGroup('   ')).toBeNull();
			expect(parseNovaGroup(null)).toBeNull();
			expect(parseNovaGroup(undefined)).toBeNull();
		});
	});

	describe('getNovaComparison', () => {
		const products = [
			createMockProduct({ code: '1', nova_group: 1 }),
			createMockProduct({ code: '2', nova_group: 3 }),
			createMockProduct({ code: '3', nova_group: '4' as unknown as number }),
			createMockProduct({ code: '4', nova_group: 'unknown' as unknown as number }),
			createMockProduct({ code: '5', nova_group: 99 as unknown as number })
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

		it('handles unknown and invalid groups gracefully without corrupting valid ones', () => {
			expect(getNovaComparison('unknown', products)).toEqual({
				isBest: false,
				isWorst: false
			});
			expect(getNovaComparison(99, products)).toEqual({
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
