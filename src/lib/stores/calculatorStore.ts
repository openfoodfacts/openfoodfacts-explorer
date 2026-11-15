import { writable, derived } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';
import type { Nutriments } from '#lib/api/nutriments.js';

export type NutritionData = {
	calories: number;
	proteins: number;
	carbohydrates: number;
	fat: number;
	sugars: number;
	salt: number;
};

export type CalculatorItem = {
	id: string;
	name: string;
	quantity: number;
	imageUrl?: string;
	nutriments: NutritionData;
};

const DEFAULT_QUANTITY_INCREMENT = 100;

export const calculatorItems = persisted<CalculatorItem[]>('nutritionCalculatorItems', []);

export const isCalculatorOpen = writable<boolean>(false);

export function addItemToCalculator(item: CalculatorItem) {
	calculatorItems.update((items) => {
		const existingIndex = items.findIndex((i) => i.id === item.id);
		if (existingIndex >= 0) {
			const updatedItems = [...items];
			updatedItems[existingIndex] = {
				...updatedItems[existingIndex],
				quantity: updatedItems[existingIndex].quantity + DEFAULT_QUANTITY_INCREMENT
			};
			return updatedItems;
		} else {
			return [...items, { ...item }];
		}
	});
	isCalculatorOpen.set(true);
}

export function updateItemQuantity(id: string, amount: number) {
	calculatorItems.update((items) => {
		const index = items.findIndex((item) => item.id === id);
		if (index === -1) return items;

		const newQuantity = items[index].quantity + amount;

		if (newQuantity <= 0) {
			return items.filter((item) => item.id !== id);
		} else {
			const updatedItems = [...items];
			updatedItems[index] = { ...updatedItems[index], quantity: newQuantity };
			return updatedItems;
		}
	});
}

export function removeItem(id: string) {
	calculatorItems.update((items) => items.filter((item) => item.id !== id));
}

export function clearCalculator() {
	calculatorItems.set([]);
}

export function toggleCalculator() {
	isCalculatorOpen.update((value) => !value);
}

export function extractNutriments(nutriments?: Nutriments | null): NutritionData {
	if (!nutriments) {
		return {
			calories: 0,
			proteins: 0,
			carbohydrates: 0,
			fat: 0,
			sugars: 0,
			salt: 0
		};
	}

	const kcal =
		nutriments['energy-kcal_100g'] ||
		(nutriments['energy-kj_100g'] ? Math.round(nutriments['energy-kj_100g'] / 4.184) : 0);

	return {
		calories: kcal || 0,
		proteins: nutriments.proteins_100g || 0,
		carbohydrates: nutriments.carbohydrates_100g || 0,
		fat: nutriments.fat_100g || 0,
		sugars: nutriments.sugars_100g || 0,
		salt: nutriments.salt_100g || 0
	};
}

function calculateTotals(items: CalculatorItem[]): NutritionData {
	const totals: NutritionData = {
		calories: 0,
		proteins: 0,
		carbohydrates: 0,
		fat: 0,
		sugars: 0,
		salt: 0
	};

	for (const item of items) {
		const factor = item.quantity / 100;
		totals.calories += item.nutriments.calories * factor;
		totals.proteins += item.nutriments.proteins * factor;
		totals.carbohydrates += item.nutriments.carbohydrates * factor;
		totals.fat += item.nutriments.fat * factor;

		if (item.nutriments.sugars) {
			totals.sugars += item.nutriments.sugars * factor;
		}
		if (item.nutriments.salt) {
			totals.salt += item.nutriments.salt * factor;
		}
	}

	return totals;
}

export const totalNutrition = derived(calculatorItems, (items) => calculateTotals(items));
