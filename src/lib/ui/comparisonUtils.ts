import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

export type ComparisonMode = 'absolute' | 'relative-first' | 'relative-best';

export type NutrientComparison = {
	value: number | null;
	formatted: string;
	diff: number | null;
	diffFormatted: string;
	isBest: boolean;
	isWorst: boolean;
};

// Nutrients rules: min is better (e.g. sugar, salt) or max is better (e.g. protein, fiber)
export const nutrientRules: Record<string, 'min' | 'max'> = {
	proteins_100g: 'max',
	fibers_100g: 'max',
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

export function getDirection(nutrientKey: string): 'min' | 'max' {
	return nutrientRules[nutrientKey] ?? 'min';
}

// Safely get a nutrient value from a product
export function getNutrientValue(product: Product, nutrientKey: string): number | null {
	const rawValue = product.nutriments?.[nutrientKey];
	if (typeof rawValue === 'number') {
		return isNaN(rawValue) ? null : rawValue;
	}

	if (typeof rawValue === 'string') {
		const parsed = parseFloat(rawValue);
		return isNaN(parsed) ? null : parsed;
	}

	return null;
}

// Get the best value for a nutrient across products
export function getBestValue(products: Product[], nutrientKey: string): number | null {
	const values = products
		.map((p) => getNutrientValue(p, nutrientKey))
		.filter((v): v is number => v !== null && !isNaN(v));
	if (!values.length) return null;

	const direction = getDirection(nutrientKey);
	return direction === 'min' ? Math.min(...values) : Math.max(...values);
}

// Get the worst value for a nutrient across products
export function getWorstValue(products: Product[], nutrientKey: string): number | null {
	const values = products
		.map((p) => getNutrientValue(p, nutrientKey))
		.filter((v): v is number => v !== null && !isNaN(v));
	if (!values.length) return null;

	const direction = getDirection(nutrientKey);
	return direction === 'min' ? Math.max(...values) : Math.min(...values);
}

// Calculate percentage difference between two values
export function calculatePercentageDiff(value: number, reference: number): number {
	if (reference === 0 || isNaN(reference) || isNaN(value)) return 0;
	return ((value - reference) / reference) * 100;
}

const integerFormatter = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 0
});

const decimalFormatter = new Intl.NumberFormat(undefined, {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

export const percentageFormatter = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 0,
	signDisplay: 'exceptZero'
});

export function formatNutrient(value: number | undefined | null, useDecimals = true): string {
	if (value === undefined || value === null || isNaN(value)) {
		return '-';
	}
	if (!useDecimals) {
		return integerFormatter.format(value);
	}
	return decimalFormatter.format(value);
}

export function getScoreComparison(
	grade: string | undefined | null,
	products: Product[],
	scoreType: 'nutriscore' | 'ecoscore'
): { isBest: boolean; isWorst: boolean } {
	if (!grade || typeof grade !== 'string') return { isBest: false, isWorst: false };

	const gradeOrder = ['a', 'b', 'c', 'd', 'e', 'f'];
	const currentIndex = gradeOrder.indexOf(grade.trim().toLowerCase());
	if (currentIndex === -1) return { isBest: false, isWorst: false };

	const validIndices = products
		.map((p) => (scoreType === 'nutriscore' ? p.nutriscore_grade : p.ecoscore_grade))
		.filter((g): g is string => typeof g === 'string' && g.trim() !== '')
		.map((g) => gradeOrder.indexOf(g.trim().toLowerCase()))
		.filter((idx) => idx !== -1);

	if (validIndices.length <= 1) return { isBest: false, isWorst: false };

	const bestIndex = Math.min(...validIndices);
	const worstIndex = Math.max(...validIndices);

	return {
		isBest: currentIndex === bestIndex && bestIndex !== worstIndex,
		isWorst: currentIndex === worstIndex && bestIndex !== worstIndex
	};
}

export function getNovaComparison(
	novaGroup: number | string | undefined | null,
	products: Product[]
): { isBest: boolean; isWorst: boolean } {
	if (novaGroup == null) return { isBest: false, isWorst: false };

	const currentGroup = typeof novaGroup === 'number' ? novaGroup : parseInt(String(novaGroup), 10);
	if (isNaN(currentGroup)) return { isBest: false, isWorst: false };

	const validGroups = products
		.map((p) => {
			const g = p.nova_group;
			if (typeof g === 'number') return g;
			if (typeof g === 'string') {
				const parsed = parseInt(g, 10);
				return isNaN(parsed) ? null : parsed;
			}
			return null;
		})
		.filter((g): g is number => g !== null && !isNaN(g));

	if (validGroups.length <= 1) return { isBest: false, isWorst: false };

	const bestGroup = Math.min(...validGroups);
	const worstGroup = Math.max(...validGroups);

	return {
		isBest: currentGroup === bestGroup && bestGroup !== worstGroup,
		isWorst: currentGroup === worstGroup && bestGroup !== worstGroup
	};
}

export function getNutrientComparison(
	product: Product,
	nutrientKey: string,
	products: Product[],
	index: number,
	comparisonMode: ComparisonMode
): NutrientComparison {
	const value = getNutrientValue(product, nutrientKey);
	const formatted = formatNutrient(value, nutrientKey !== 'energy-kcal_100g');

	if (value == null) {
		return {
			value,
			formatted,
			diff: null,
			diffFormatted: '',
			isBest: false,
			isWorst: false
		};
	}

	let referenceValue: number | null = null;
	if (comparisonMode === 'relative-first' && index > 0) {
		referenceValue = getNutrientValue(products[0], nutrientKey);
	} else if (comparisonMode === 'relative-best') {
		referenceValue = getBestValue(products, nutrientKey);
	}

	let diff: number | null = null;
	let diffFormatted = '';
	if (referenceValue != null && referenceValue !== value) {
		diff = calculatePercentageDiff(value, referenceValue);
		diffFormatted = `${percentageFormatter.format(diff)}%`;
	}

	const bestValue = getBestValue(products, nutrientKey);
	const worstValue = getWorstValue(products, nutrientKey);

	const comparableCount = products
		.map((p) => getNutrientValue(p, nutrientKey))
		.filter((v): v is number => v !== null && !isNaN(v)).length;

	const isBest =
		comparableCount > 1 &&
		bestValue != null &&
		worstValue != null &&
		bestValue !== worstValue &&
		bestValue === value;
	const isWorst =
		comparableCount > 1 &&
		bestValue != null &&
		worstValue != null &&
		bestValue !== worstValue &&
		worstValue === value;

	return {
		value,
		formatted,
		diff,
		diffFormatted,
		isBest,
		isWorst
	};
}

export function getDiffColorClass(
	diff: number | null,
	isBest: boolean,
	isWorst: boolean,
	nutrientKey: string
): string {
	if (isBest) return 'text-success font-semibold';
	if (isWorst) return 'text-error';
	if (diff == null) return '';

	const direction = getDirection(nutrientKey);

	if (direction === 'min') {
		return diff < 0 ? 'text-success' : 'text-warning';
	} else {
		return diff > 0 ? 'text-success' : 'text-warning';
	}
}
