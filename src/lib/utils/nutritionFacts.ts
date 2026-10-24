/**
 * Core nutrients required by food labeling standards (EU, US FDA, Codex Alimentarius).
 * A product with declared nutrition facts must contain at least one of these.
 */
export const CORE_NUTRIENTS = [
	'energy',
	'energy-kcal',
	'energy-kj',
	'fat',
	'saturated-fat',
	'carbohydrates',
	'sugars',
	'proteins',
	'salt',
	'sodium'
] as const;

export type CoreNutrient = (typeof CORE_NUTRIENTS)[number];

/**
 * Checks whether a value represents a valid numeric nutrient amount.
 */
export function isValidNutrientNumber(val: unknown): boolean {
	if (typeof val === 'number') {
		return !Number.isNaN(val);
	}
	if (typeof val === 'string' && val.trim() !== '') {
		const parsed = Number(val);
		return !Number.isNaN(parsed);
	}
	return false;
}

/**
 * Determines whether the product has actual nutrition facts entered.
 *
 * Estimated fields (e.g. `fruits-vegetables-*-estimate-from-ingredients*`,
 * `carbon-footprint-*`, or computed `added-sugars`) do not count as declared
 * nutrition facts from packaging.
 */
export function hasNutritionFacts(
	product: { nutriments?: Record<string, unknown> | null } | null | undefined
): boolean {
	const nutriments = product?.nutriments;
	if (!nutriments || typeof nutriments !== 'object') {
		return false;
	}

	return CORE_NUTRIENTS.some((nutrient) => {
		const val100g = nutriments[`${nutrient}_100g`];
		const valServing = nutriments[`${nutrient}_serving`];
		const valRaw = nutriments[nutrient];
		const valValue = nutriments[`${nutrient}_value`];

		return (
			isValidNutrientNumber(val100g) ||
			isValidNutrientNumber(valServing) ||
			isValidNutrientNumber(valRaw) ||
			isValidNutrientNumber(valValue)
		);
	});
}

/**
 * Determines whether nutrition data is missing for a given product.
 * Requires a valid product code so invalid/loading states do not trigger false positives.
 */
export function isNutritionMissing(
	product:
		| {
				code?: string;
				nutriments?: Record<string, unknown> | null;
				states_tags?: string[] | null;
		  }
		| null
		| undefined
): boolean {
	if (!product?.code) {
		return false;
	}

	if (product.states_tags?.includes('en:nutrition-facts-to-be-completed')) {
		return true;
	}

	return !hasNutritionFacts(product);
}
