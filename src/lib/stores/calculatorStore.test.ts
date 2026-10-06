import { beforeEach, describe, expect, it } from 'vitest';
import { get } from 'svelte/store';
import type { Nutriments } from '$lib/api/nutriments';
import {
	addItemToCalculator,
	calculateTotals,
	calculatorItems,
	clearCalculator,
	extractNutriments,
	hasNoNutritionData,
	removeItem,
	updateItemQuantity,
	type CalculatorItem
} from './calculatorStore';

function makeItem(overrides: Partial<CalculatorItem> = {}): CalculatorItem {
	return {
		id: '123',
		name: 'Test product',
		quantity: 100,
		nutriments: { calories: 200, proteins: 10, carbohydrates: 30, fat: 5, sugars: 12, salt: 1 },
		...overrides
	};
}

describe('extractNutriments', () => {
	it('reads per-100g values', () => {
		const nutriments: Partial<Nutriments> = {
			'energy-kcal_100g': 250,
			proteins_100g: 8,
			carbohydrates_100g: 40,
			fat_100g: 6,
			sugars_100g: 20,
			salt_100g: 0.5
		};
		expect(extractNutriments(nutriments)).toEqual({
			calories: 250,
			proteins: 8,
			carbohydrates: 40,
			fat: 6,
			sugars: 20,
			salt: 0.5
		});
	});

	it('converts kJ to kcal when kcal is missing', () => {
		const result = extractNutriments({ 'energy-kj_100g': 418.4 });
		expect(result.calories).toBeCloseTo(100);
	});

	it('prefers kcal over kJ', () => {
		const result = extractNutriments({ 'energy-kcal_100g': 0, 'energy-kj_100g': 418.4 });
		expect(result.calories).toBe(0);
	});

	it('returns zeros when nutriments are missing', () => {
		expect(extractNutriments(undefined)).toEqual({
			calories: 0,
			proteins: 0,
			carbohydrates: 0,
			fat: 0
		});
	});
});

describe('hasNoNutritionData', () => {
	it('is true for missing or empty nutriments', () => {
		expect(hasNoNutritionData(undefined)).toBe(true);
		expect(hasNoNutritionData({})).toBe(true);
	});

	it('is false when any used value is present, including 0', () => {
		expect(hasNoNutritionData({ fat_100g: 0 })).toBe(false);
		expect(hasNoNutritionData({ 'energy-kj_100g': 100 })).toBe(false);
	});
});

describe('calculateTotals', () => {
	it('scales values by quantity', () => {
		const totals = calculateTotals([
			makeItem({ quantity: 50 }),
			makeItem({ id: '456', quantity: 200 })
		]);
		expect(totals.calories).toBeCloseTo(500);
		expect(totals.proteins).toBeCloseTo(25);
		expect(totals.carbohydrates).toBeCloseTo(75);
		expect(totals.fat).toBeCloseTo(12.5);
		expect(totals.sugars).toBeCloseTo(30);
		expect(totals.salt).toBeCloseTo(2.5);
	});

	it('handles missing sugars and salt', () => {
		const totals = calculateTotals([
			makeItem({ nutriments: { calories: 100, proteins: 1, carbohydrates: 2, fat: 3 } })
		]);
		expect(totals.sugars).toBe(0);
		expect(totals.salt).toBe(0);
	});
});

describe('calculator items', () => {
	beforeEach(() => {
		clearCalculator();
	});

	it('adds 100 g to an existing item without mutating the previous state', () => {
		addItemToCalculator(makeItem());
		const before = get(calculatorItems);

		addItemToCalculator(makeItem());
		const after = get(calculatorItems);

		expect(after).toHaveLength(1);
		expect(after[0].quantity).toBe(200);
		expect(before[0].quantity).toBe(100);
	});

	it('updates quantity and removes items that reach 0', () => {
		addItemToCalculator(makeItem({ quantity: 50 }));

		updateItemQuantity('123', 25);
		expect(get(calculatorItems)[0].quantity).toBe(75);

		updateItemQuantity('123', -75);
		expect(get(calculatorItems)).toHaveLength(0);
	});

	it('removes a single item', () => {
		addItemToCalculator(makeItem());
		addItemToCalculator(makeItem({ id: '456' }));

		removeItem('123');
		expect(get(calculatorItems).map((i) => i.id)).toEqual(['456']);
	});
});
