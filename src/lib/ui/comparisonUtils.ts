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

// Generates a stable, unique key for products in keyed loops
export function getProductKey(product: Product, index: number, products?: Product[]): string {
	const code = product?.code != null ? String(product.code).trim() : '';
	if (!code) {
		return `__no_code_${index}`;
	}
	if (products) {
		const firstIndex = products.findIndex((p) => p.code != null && String(p.code).trim() === code);
		if (firstIndex !== -1 && firstIndex !== index) {
			return `${code}__dup_${index}`;
		}
	}
	return code;
}

// Safely get a nutrient value from a product, rejecting NaN and non-finite numbers
export function getNutrientValue(product: Product, nutrientKey: string): number | null {
	const rawValue = product.nutriments?.[nutrientKey];
	if (typeof rawValue === 'number') {
		return isNaN(rawValue) || !isFinite(rawValue) ? null : rawValue;
	}

	if (typeof rawValue === 'string') {
		const parsed = parseFloat(rawValue.trim());
		return isNaN(parsed) || !isFinite(parsed) ? null : parsed;
	}

	return null;
}

// Get the best value for a nutrient across products
export function getBestValue(products: Product[], nutrientKey: string): number | null {
	const values = products
		.map((p) => getNutrientValue(p, nutrientKey))
		.filter((v): v is number => v !== null && !isNaN(v) && isFinite(v));
	if (!values.length) return null;

	const direction = getDirection(nutrientKey);
	return direction === 'min' ? Math.min(...values) : Math.max(...values);
}

// Get the worst value for a nutrient across products
export function getWorstValue(products: Product[], nutrientKey: string): number | null {
	const values = products
		.map((p) => getNutrientValue(p, nutrientKey))
		.filter((v): v is number => v !== null && !isNaN(v) && isFinite(v));
	if (!values.length) return null;

	const direction = getDirection(nutrientKey);
	return direction === 'min' ? Math.max(...values) : Math.min(...values);
}

// Calculate percentage difference between two values
export function calculatePercentageDiff(value: number, reference: number): number {
	if (
		reference === 0 ||
		!isFinite(reference) ||
		isNaN(reference) ||
		!isFinite(value) ||
		isNaN(value)
	) {
		return 0;
	}
	const diff = ((value - reference) / reference) * 100;
	return !isFinite(diff) || isNaN(diff) ? 0 : diff;
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
	if (value === undefined || value === null || !isFinite(value) || isNaN(value)) {
		return '-';
	}
	if (!useDecimals) {
		return integerFormatter.format(value);
	}
	return decimalFormatter.format(value);
}

// Supported score grades in Open Food Facts (Nutri-Score and Eco-Score / Green-Score: A to E)
export const VALID_SCORE_GRADES = ['a', 'b', 'c', 'd', 'e'] as const;

export function getScoreComparison(
	grade: string | undefined | null,
	products: Product[],
	scoreType: 'nutriscore' | 'ecoscore'
): { isBest: boolean; isWorst: boolean } {
	if (!grade || typeof grade !== 'string') return { isBest: false, isWorst: false };

	const cleanGrade = grade.trim().toLowerCase();
	const currentIndex = VALID_SCORE_GRADES.indexOf(
		cleanGrade as (typeof VALID_SCORE_GRADES)[number]
	);
	if (currentIndex === -1) return { isBest: false, isWorst: false };

	const validIndices = products
		.map((p) => (scoreType === 'nutriscore' ? p.nutriscore_grade : p.ecoscore_grade))
		.filter((g): g is string => typeof g === 'string' && g.trim() !== '')
		.map((g) =>
			VALID_SCORE_GRADES.indexOf(g.trim().toLowerCase() as (typeof VALID_SCORE_GRADES)[number])
		)
		.filter((idx) => idx !== -1);

	if (validIndices.length <= 1) return { isBest: false, isWorst: false };

	const bestIndex = Math.min(...validIndices);
	const worstIndex = Math.max(...validIndices);

	return {
		isBest: currentIndex === bestIndex && bestIndex !== worstIndex,
		isWorst: currentIndex === worstIndex && bestIndex !== worstIndex
	};
}

// Parse NOVA group according to Open Food Facts data model (integers 1 to 4)
export function parseNovaGroup(group: number | string | undefined | null): number | null {
	if (group == null) return null;
	const num = typeof group === 'number' ? group : parseInt(String(group).trim(), 10);
	if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 4) {
		return null;
	}
	return num;
}

export function getNovaComparison(
	novaGroup: number | string | undefined | null,
	products: Product[]
): { isBest: boolean; isWorst: boolean } {
	const currentGroup = parseNovaGroup(novaGroup);
	if (currentGroup === null) return { isBest: false, isWorst: false };

	const validGroups = products
		.map((p) => parseNovaGroup(p.nova_group))
		.filter((g): g is number => g !== null);

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
		.filter((v): v is number => v !== null && !isNaN(v) && isFinite(v)).length;

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
