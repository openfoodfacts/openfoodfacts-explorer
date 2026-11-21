import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

type Direction = 'min' | 'max';

type Rank = {
	isBest: boolean;
	isWorst: boolean;
};

// Whether a lower ('min') or a higher ('max') amount of each nutrient is better
const nutrientRules: Record<string, Direction> = {
	proteins_100g: 'max',
	fiber_100g: 'max',
	'fruits-vegetables-nuts-estimate-from-ingredients_100g': 'max',
	sugars_100g: 'min',
	salt_100g: 'min',
	sodium_100g: 'min',
	alcohol_100g: 'min',
	carbohydrates_100g: 'min',
	'energy-kcal_100g': 'min',
	'energy-kj_100g': 'min',
	fat_100g: 'min',
	'saturated-fat_100g': 'min'
};

// Keys to try when the main key is missing, like the CSV export does
const nutrientFallbackKeys: Record<string, string> = {
	fiber_100g: 'fibers_100g'
};

/** Whether a lower or a higher amount of the nutrient is better. Lower by default. */
export function getDirection(nutrientKey: string): Direction {
	const direction = nutrientRules[nutrientKey];
	if (direction === undefined) {
		return 'min';
	}
	return direction;
}

/** Turn a raw nutriment value into a number, or null when it is not one. */
function toNumber(rawValue: unknown): number | null {
	if (typeof rawValue === 'number') {
		return rawValue;
	}

	// Some values come as strings, e.g. "4.2"
	if (typeof rawValue === 'string') {
		const parsed = parseFloat(rawValue);
		if (isNaN(parsed)) {
			return null;
		}
		return parsed;
	}

	return null;
}

/** Read a nutrient value from a product, or null when it is missing. */
export function getNutrientValue(product: Product, nutrientKey: string): number | null {
	const nutriments = product.nutriments;
	if (!nutriments) {
		return null;
	}

	const value = toNumber(nutriments[nutrientKey]);
	if (value !== null) {
		return value;
	}

	const fallbackKey = nutrientFallbackKeys[nutrientKey];
	if (fallbackKey === undefined) {
		return null;
	}
	return toNumber(nutriments[fallbackKey]);
}

/** The values of a nutrient for the products that have it. */
function getValues(products: Product[], nutrientKey: string): number[] {
	const values: number[] = [];
	for (const product of products) {
		const value = getNutrientValue(product, nutrientKey);
		if (value !== null) {
			values.push(value);
		}
	}
	return values;
}

/** The best value of a nutrient among the products, or null when none has it. */
export function getBestValue(products: Product[], nutrientKey: string): number | null {
	const values = getValues(products, nutrientKey);
	if (values.length === 0) {
		return null;
	}

	if (getDirection(nutrientKey) === 'min') {
		return Math.min(...values);
	}
	return Math.max(...values);
}

/** The worst value of a nutrient among the products, or null when none has it. */
export function getWorstValue(products: Product[], nutrientKey: string): number | null {
	const values = getValues(products, nutrientKey);
	if (values.length === 0) {
		return null;
	}

	if (getDirection(nutrientKey) === 'min') {
		return Math.max(...values);
	}
	return Math.min(...values);
}

/** Whether a value is the best or the worst one among the compared products. */
export function getRank(products: Product[], nutrientKey: string, value: number): Rank {
	const noRank: Rank = { isBest: false, isWorst: false };

	// Nothing to rank when only one product has this nutrient
	const values = getValues(products, nutrientKey);
	if (values.length < 2) {
		return noRank;
	}

	const bestValue = getBestValue(products, nutrientKey);
	const worstValue = getWorstValue(products, nutrientKey);

	// Nothing to rank when every product has the same value
	if (bestValue === worstValue) {
		return noRank;
	}

	return {
		isBest: value === bestValue,
		isWorst: value === worstValue
	};
}

/** Percentage difference from the reference, or null when the reference is 0. */
export function calculatePercentageDiff(value: number, reference: number): number | null {
	// A change from 0 has no percentage
	if (reference === 0) {
		return null;
	}

	const difference = value - reference;
	return (difference / reference) * 100;
}
