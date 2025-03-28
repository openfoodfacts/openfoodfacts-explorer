import { writable, get } from 'svelte/store';
import type { Nutriments } from '$lib/api/nutriments';

export type CalculatorItem = {
	id: string;
	name: string;
	quantity: number;
	imageUrl?: string;
	nutriments: {
		calories: number;
		proteins: number;
		carbohydrates: number;
		fat: number;
		sugars?: number;
		salt?: number;
	};
};

function loadFromStorage(): CalculatorItem[] {
	if (typeof window === 'undefined') return [];

	try {
		const stored = localStorage.getItem('nutritionCalculatorItems');
		return stored ? JSON.parse(stored) : [];
	} catch (e) {
		console.error('Failed to load calculator data from localStorage:', e);
		return [];
	}
}

function saveToStorage(items: CalculatorItem[]): void {
	if (typeof window === 'undefined') return;

	try {
		localStorage.setItem('nutritionCalculatorItems', JSON.stringify(items));
	} catch (e) {
		console.error('Failed to save calculator data to localStorage:', e);
	}
}

export const calculatorItems = writable<CalculatorItem[]>(loadFromStorage());
export const isCalculatorOpen = writable<boolean>(false);

calculatorItems.subscribe((items) => {
	saveToStorage(items);
});

export function addItemToCalculator(item: CalculatorItem) {
	calculatorItems.update((items) => {
		const existingIndex = items.findIndex((i) => i.id === item.id);
		if (existingIndex >= 0) {
			const updatedItems = [...items];
			updatedItems[existingIndex].quantity += 100;
			return updatedItems;
		} else {
			return [...items, item];
		}
	});
}

export function updateItemQuantity(id: string, amount: number) {
	calculatorItems.update((items) => {
		const index = items.findIndex((item) => item.id === id);
		if (index === -1) return items;

		const updatedItems = [...items];
		const newQuantity = updatedItems[index].quantity + amount;

		if (newQuantity <= 0) {
			return items.filter((item) => item.id !== id);
		} else {
			updatedItems[index].quantity = newQuantity;
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

export function extractNutriments(nutriments: Nutriments): CalculatorItem['nutriments'] {
	return {
		calories: nutriments['energy-kcal_100g'] || 0,
		proteins: nutriments.proteins_100g || 0,
		carbohydrates: nutriments.carbohydrates_100g || 0,
		fat: nutriments.fat_100g || 0,
		sugars: nutriments.sugars_100g,
		salt: nutriments.salt_100g
	};
}
