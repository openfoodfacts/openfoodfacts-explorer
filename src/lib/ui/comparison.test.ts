import { describe, expect, it } from 'vitest';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

import {
	calculatePercentageDiff,
	getBestValue,
	getDirection,
	getNutrientValue,
	getRank,
	getWorstValue
} from './comparison';

function productWith(nutriments: Record<string, number | string>): Product {
	return { nutriments } as unknown as Product;
}

describe('getDirection', () => {
	it('prefers lower sugar and higher fiber', () => {
		expect(getDirection('sugars_100g')).toBe('min');
		expect(getDirection('fiber_100g')).toBe('max');
	});

	it('prefers lower values for an unknown nutrient', () => {
		expect(getDirection('unknown_100g')).toBe('min');
	});
});

describe('getNutrientValue', () => {
	it('reads fiber_100g', () => {
		expect(getNutrientValue(productWith({ fiber_100g: 10 }), 'fiber_100g')).toBe(10);
	});

	it('falls back to fibers_100g', () => {
		expect(getNutrientValue(productWith({ fibers_100g: 6.4 }), 'fiber_100g')).toBe(6.4);
	});

	it('uses fiber_100g when both keys are present', () => {
		const product = productWith({ fiber_100g: 10, fibers_100g: 6.4 });

		expect(getNutrientValue(product, 'fiber_100g')).toBe(10);
	});

	it('parses string values', () => {
		expect(getNutrientValue(productWith({ sugars_100g: '4.2' }), 'sugars_100g')).toBe(4.2);
	});

	it('returns null for a string that is not a number', () => {
		expect(getNutrientValue(productWith({ sugars_100g: 'abc' }), 'sugars_100g')).toBeNull();
	});

	it('returns null when the nutrient is missing', () => {
		expect(getNutrientValue(productWith({}), 'fiber_100g')).toBeNull();
	});

	it('returns null when the product has no nutriments', () => {
		const product = {} as unknown as Product;

		expect(getNutrientValue(product, 'sugars_100g')).toBeNull();
	});
});

describe('calculatePercentageDiff', () => {
	it('returns a positive difference when the value is higher', () => {
		expect(calculatePercentageDiff(5, 4)).toBe(25);
	});

	it('returns a negative difference when the value is lower', () => {
		expect(calculatePercentageDiff(3, 4)).toBe(-25);
	});

	it('returns null when the reference is 0', () => {
		expect(calculatePercentageDiff(10.6, 0)).toBeNull();
	});
});

describe('getBestValue and getWorstValue', () => {
	const products = [
		productWith({ sugars_100g: 4.2 }),
		productWith({}),
		productWith({ sugars_100g: 10.6 }),
		productWith({ sugars_100g: 5.5 })
	];

	it('skips products without the nutrient', () => {
		expect(getBestValue(products, 'sugars_100g')).toBe(4.2);
		expect(getWorstValue(products, 'sugars_100g')).toBe(10.6);
	});

	it('returns null when no product has the nutrient', () => {
		expect(getBestValue(products, 'fiber_100g')).toBeNull();
		expect(getWorstValue(products, 'fiber_100g')).toBeNull();
	});
});

describe('getRank', () => {
	it('marks the lower value as best for nutrients where less is better', () => {
		const products = [productWith({ sugars_100g: 4.2 }), productWith({ sugars_100g: 5.5 })];

		expect(getRank(products, 'sugars_100g', 4.2)).toEqual({ isBest: true, isWorst: false });
		expect(getRank(products, 'sugars_100g', 5.5)).toEqual({ isBest: false, isWorst: true });
	});

	it('marks the higher value as best for nutrients where more is better', () => {
		const products = [productWith({ fiber_100g: 10 }), productWith({ fiber_100g: 6.4 })];

		expect(getRank(products, 'fiber_100g', 10)).toEqual({ isBest: true, isWorst: false });
		expect(getRank(products, 'fiber_100g', 6.4)).toEqual({ isBest: false, isWorst: true });
	});

	it('marks neither for a value in the middle', () => {
		const products = [
			productWith({ salt_100g: 0.3 }),
			productWith({ salt_100g: 1.1 }),
			productWith({ salt_100g: 0.7 })
		];

		expect(getRank(products, 'salt_100g', 0.7)).toEqual({ isBest: false, isWorst: false });
	});

	it('marks every product that shares the best value', () => {
		const products = [
			productWith({ salt_100g: 0 }),
			productWith({ salt_100g: 0 }),
			productWith({ salt_100g: 1 })
		];

		expect(getRank(products, 'salt_100g', 0)).toEqual({ isBest: true, isWorst: false });
		expect(getRank(products, 'salt_100g', 1)).toEqual({ isBest: false, isWorst: true });
	});

	it('does not rank when only one product has the nutrient', () => {
		const products = [productWith({ salt_100g: 1 }), productWith({})];

		expect(getRank(products, 'salt_100g', 1)).toEqual({ isBest: false, isWorst: false });
	});

	it('does not rank when all values are equal', () => {
		const products = [productWith({ salt_100g: 0 }), productWith({ salt_100g: 0 })];

		expect(getRank(products, 'salt_100g', 0)).toEqual({ isBest: false, isWorst: false });
	});
});
