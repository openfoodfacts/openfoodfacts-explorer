import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
	calculatorItems,
	isCalculatorOpen,
	addItemToCalculator,
	updateItemQuantity,
	removeItem,
	clearCalculator,
	toggleCalculator,
	extractNutriments,
	totalNutrition,
	type CalculatorItem
} from './calculatorStore.js';
import type { Nutriments } from '#lib/api/nutriments.js';

describe('calculatorStore', () => {
	beforeEach(() => {
		clearCalculator();
		isCalculatorOpen.set(false);
	});

	describe('extractNutriments', () => {
		it('returns all zeros when nutriments is null or undefined', () => {
			expect(extractNutriments(null)).toEqual({
				calories: 0,
				proteins: 0,
				carbohydrates: 0,
				fat: 0,
				sugars: 0,
				salt: 0
			});
			expect(extractNutriments(undefined)).toEqual({
				calories: 0,
				proteins: 0,
				carbohydrates: 0,
				fat: 0,
				sugars: 0,
				salt: 0
			});
		});

		it('extracts values directly when energy-kcal_100g is provided', () => {
			const nutriments = {
				'energy-kcal_100g': 250,
				proteins_100g: 10,
				carbohydrates_100g: 30,
				fat_100g: 5,
				sugars_100g: 12,
				salt_100g: 0.8
			} as Nutriments;

			const result = extractNutriments(nutriments);
			expect(result).toEqual({
				calories: 250,
				proteins: 10,
				carbohydrates: 30,
				fat: 5,
				sugars: 12,
				salt: 0.8
			});
		});

		it('calculates kcal from energy-kj_100g when kcal is missing', () => {
			const nutriments = {
				'energy-kj_100g': 837, // ~200 kcal
				proteins_100g: 8,
				carbohydrates_100g: 20,
				fat_100g: 4
			} as Nutriments;

			const result = extractNutriments(nutriments);
			expect(result.calories).toBe(Math.round(837 / 4.184));
			expect(result.proteins).toBe(8);
			expect(result.sugars).toBe(0);
			expect(result.salt).toBe(0);
		});
	});

	describe('addItemToCalculator & toggleCalculator', () => {
		const sampleItem: CalculatorItem = {
			id: 'item-1',
			name: 'Granola Bar',
			quantity: 100,
			nutriments: {
				calories: 400,
				proteins: 10,
				carbohydrates: 60,
				fat: 15,
				sugars: 20,
				salt: 0.5
			}
		};

		it('adds item and opens calculator', () => {
			expect(get(isCalculatorOpen)).toBe(false);
			expect(get(calculatorItems)).toHaveLength(0);

			addItemToCalculator(sampleItem);

			expect(get(calculatorItems)).toHaveLength(1);
			expect(get(calculatorItems)[0].id).toBe('item-1');
			expect(get(isCalculatorOpen)).toBe(true);
		});

		it('increments quantity by 100 when adding existing item', () => {
			addItemToCalculator(sampleItem);
			addItemToCalculator(sampleItem);

			const items = get(calculatorItems);
			expect(items).toHaveLength(1);
			expect(items[0].quantity).toBe(200);
		});

		it('toggles calculator open state', () => {
			expect(get(isCalculatorOpen)).toBe(false);
			toggleCalculator();
			expect(get(isCalculatorOpen)).toBe(true);
			toggleCalculator();
			expect(get(isCalculatorOpen)).toBe(false);
		});
	});

	describe('updateItemQuantity & removeItem', () => {
		const itemA: CalculatorItem = {
			id: 'a',
			name: 'Apple',
			quantity: 100,
			nutriments: { calories: 52, proteins: 0.3, carbohydrates: 14, fat: 0.2, sugars: 10, salt: 0 }
		};

		it('updates item quantity by given delta', () => {
			addItemToCalculator(itemA);
			updateItemQuantity('a', 50);
			expect(get(calculatorItems)[0].quantity).toBe(150);

			updateItemQuantity('a', -25);
			expect(get(calculatorItems)[0].quantity).toBe(125);
		});

		it('removes item if quantity drops to 0 or below', () => {
			addItemToCalculator(itemA);
			updateItemQuantity('a', -100);
			expect(get(calculatorItems)).toHaveLength(0);
		});

		it('does nothing when updating non-existent item id', () => {
			addItemToCalculator(itemA);
			updateItemQuantity('non-existent', 50);
			expect(get(calculatorItems)).toHaveLength(1);
		});

		it('removes item with removeItem', () => {
			addItemToCalculator(itemA);
			expect(get(calculatorItems)).toHaveLength(1);
			removeItem('a');
			expect(get(calculatorItems)).toHaveLength(0);
		});
	});

	describe('totalNutrition derived store', () => {
		it('calculates scaled totals across multiple items', () => {
			const item1: CalculatorItem = {
				id: '1',
				name: 'Oats',
				quantity: 50, // half 100g
				nutriments: {
					calories: 360,
					proteins: 12,
					carbohydrates: 60,
					fat: 6,
					sugars: 2,
					salt: 0.1
				}
			};

			const item2: CalculatorItem = {
				id: '2',
				name: 'Milk',
				quantity: 200, // double 100g
				nutriments: {
					calories: 60,
					proteins: 3.2,
					carbohydrates: 4.8,
					fat: 3.2,
					sugars: 4.8,
					salt: 0.1
				}
			};

			addItemToCalculator(item1);
			addItemToCalculator(item2);

			const totals = get(totalNutrition);
			// Oats (0.5x): cal=180, pro=6, carb=30, fat=3, sug=1, salt=0.05
			// Milk (2x): cal=120, pro=6.4, carb=9.6, fat=6.4, sug=9.6, salt=0.2
			expect(totals.calories).toBeCloseTo(300);
			expect(totals.proteins).toBeCloseTo(12.4);
			expect(totals.carbohydrates).toBeCloseTo(39.6);
			expect(totals.fat).toBeCloseTo(9.4);
			expect(totals.sugars).toBeCloseTo(10.6);
			expect(totals.salt).toBeCloseTo(0.25);
		});
	});
});
