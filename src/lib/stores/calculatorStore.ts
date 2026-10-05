import { writable, derived } from 'svelte/store';
import { persisted } from 'svelte-local-storage-store';
import type { Nutriments } from '$lib/api/nutriments';

export type NutritionData = {
	calories: number;
	proteins: number;
	carbohydrates: number;
	fat: number;
	sugars?: number;
	salt?: number;
};

export type CalculatorItem = {
	id: string;
	name: string;
	quantity: number;
	imageUrl?: string;
	nutriments: NutritionData;
	/** True when the product has no nutrition data, so its values are all 0 */
	missingNutrition?: boolean;
};

const DEFAULT_QUANTITY_INCREMENT = 100;
const KJ_PER_KCAL = 4.184;

export const calculatorItems = persisted<CalculatorItem[]>('nutritionCalculatorItems', []);

export const isCalculatorOpen = writable<boolean>(false);

export function addItemToCalculator(item: CalculatorItem) {
	calculatorItems.update((items) => {
		const existing = items.find((i) => i.id === item.id);
		if (existing) {
			return items.map((i) =>
				i.id === item.id ? { ...i, quantity: i.quantity + DEFAULT_QUANTITY_INCREMENT } : i
			);
		}
		return [...items, item];
	});
	isCalculatorOpen.set(true);
}

export function updateItemQuantity(id: string, amount: number) {
	calculatorItems.update((items) =>
		items
			.map((item) => (item.id === id ? { ...item, quantity: item.quantity + amount } : item))
			.filter((item) => item.quantity > 0)
	);
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

function getCalories(nutriments: Partial<Nutriments>): number {
	const kcal = nutriments['energy-kcal_100g'];
	if (kcal != null) return kcal;

	const kj = nutriments['energy-kj_100g'];
	if (kj != null) return kj / KJ_PER_KCAL;

	return 0;
}

export function extractNutriments(nutriments: Partial<Nutriments> | undefined): NutritionData {
	if (!nutriments) {
		return { calories: 0, proteins: 0, carbohydrates: 0, fat: 0 };
	}

	return {
		calories: getCalories(nutriments),
		proteins: nutriments.proteins_100g || 0,
		carbohydrates: nutriments.carbohydrates_100g || 0,
		fat: nutriments.fat_100g || 0,
		sugars: nutriments.sugars_100g,
		salt: nutriments.salt_100g
	};
}

/** Whether the nutriments contain none of the values used by the calculator */
export function hasNoNutritionData(nutriments: Partial<Nutriments> | undefined): boolean {
	if (!nutriments) return true;

	const keys: (keyof Nutriments)[] = [
		'energy-kcal_100g',
		'energy-kj_100g',
		'proteins_100g',
		'carbohydrates_100g',
		'fat_100g',
		'sugars_100g',
		'salt_100g'
	];
	return keys.every((key) => nutriments[key] == null);
}

export function calculateTotals(items: CalculatorItem[]): Required<NutritionData> {
	const totals: Required<NutritionData> = {
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
