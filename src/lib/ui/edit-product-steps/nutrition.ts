import type { Product } from '$lib/api';

type Issue = {
	severity: 'warning' | 'error';
	field?: string; // e.g., 'energy', 'proteins', 'all', etc.
	title: string;
	desc?: string;
};

type ServingSizeValidationResult = 'valid' | 'missing-number' | 'missing-unit' | 'unknown-unit';

type AnalysisFunc = (product: Product) => Issue[];

// Match numeric tokens so we can inspect the surrounding text for units.
const NUMBER_PATTERN = /\.\d+|\d+(?:(?:,|\.)\d+)?/g;
// Match characters that are letters in any language.
const LETTER_PATTERN = /\p{L}/u;

function isLetter(character: string | undefined): boolean {
	return character != null && LETTER_PATTERN.test(character);
}

function containsKnownUnit(token: string, units: readonly string[]): boolean {
	// Return true when the token contains a known unit as a standalone token.
	for (const unit of units) {
		let currentIndex = token.indexOf(unit);

		while (currentIndex !== -1) {
			const previousChar = token[currentIndex - 1];
			const nextChar = token[currentIndex + unit.length];
			if (!isLetter(previousChar) && !isLetter(nextChar)) {
				return true;
			}

			currentIndex = token.indexOf(unit, currentIndex + unit.length);
		}
	}

	return false;
}

function validateServingSize(
	servingSize: string | null | undefined,
	units: readonly string[]
): ServingSizeValidationResult {
	const normalizedServingSize = (servingSize ?? '').toLowerCase().trim();

	if (normalizedServingSize === '') {
		return 'valid';
	}

	if (normalizedServingSize.match(NUMBER_PATTERN) == null) {
		return 'missing-number';
	}

	const tokens = normalizedServingSize.split(NUMBER_PATTERN);
	let containsUnknownUnit = false;

	for (const token of tokens) {
		if (token.trim() === '') {
			continue;
		}

		if (containsKnownUnit(token, units)) {
			return 'valid';
		}

		if (LETTER_PATTERN.test(token)) {
			containsUnknownUnit = true;
		}
	}

	if (containsUnknownUnit) {
		return 'unknown-unit';
	}

	return 'missing-unit';
}

export function getServingSizeIssue(
	servingSize: string | null | undefined,
	units: readonly string[]
): Issue | null {
	const validationResult = validateServingSize(servingSize, units);
	const servingSizeExamples = 'Examples: 40 g, 250 ml, or 1 serving (30 g).';

	switch (validationResult) {
		case 'valid':
			return null;
		case 'missing-number':
			return {
				severity: 'error',
				field: 'serving_size',
				title: 'Serving size is missing a number',
				desc: `Serving size should include a numeric value. ${servingSizeExamples}`
			};
		case 'missing-unit':
			return {
				severity: 'error',
				field: 'serving_size',
				title: 'Serving size is missing a unit',
				desc: `Serving size should include a unit. ${servingSizeExamples}`
			};
		case 'unknown-unit':
			return {
				severity: 'warning',
				field: 'serving_size',
				title: 'Serving size unit may be incorrect',
				desc: `Serving size should include a common unit. ${servingSizeExamples}`
			};
	}
}

const energyMismatchAnalysis: AnalysisFunc = (product) => {
	const kcalToKjFactor = 4.184;
	const energyKj = product.nutriments?.['energy-kj_100g'] ?? product.nutriments?.['energy_100g'];
	const energyKcal = product.nutriments?.['energy-kcal_100g'];

	if (energyKj != null && energyKcal != null) {
		// Convert kJ to kcal: 1 kcal = 4.184 kJ
		const convertedKcal = energyKj / kcalToKjFactor;
		const convertedKj = energyKcal * kcalToKjFactor;
		const mismatch = Math.abs(convertedKcal - energyKcal) / ((convertedKcal + energyKcal) / 2);
		if (mismatch > 0.1) {
			return [
				{
					severity: 'warning',
					field: 'energy',
					title: 'Energy values in kJ and kcal differ by more than 10%',
					desc:
						`Either the kJ or kcal value is incorrect.` +
						` ${energyKj.toFixed(2)} kJ ->` +
						` ${convertedKcal.toFixed(2)} kcal;` +
						` ${energyKcal.toFixed(2)} kcal ->` +
						` ${convertedKj.toFixed(2)} kJ (difference: ${(mismatch * 100).toFixed(2)}%).`
				}
			];
		}
	}
	return [];
};

const energyFromMacronutrientsAnalysis: AnalysisFunc = (product) => {
	const protein = product.nutriments?.['proteins'] ?? 0;
	const carbs = product.nutriments?.['carbohydrates'] ?? 0;
	const fat = product.nutriments?.['fat'] ?? 0;
	const fiber = product.nutriments?.['fibers'] ?? 0;
	const alcohol = product.nutriments?.['alcohol'] ?? 0;

	const calculatedKcal = protein * 4 + carbs * 4 + fat * 9 + fiber * 2 + alcohol * 7;

	let energyKcal = product.nutriments?.['energy-kcal_100g'];
	if (energyKcal == null) {
		const energyKj = product.nutriments?.['energy-kj_100g'] ?? product.nutriments?.['energy_100g'];
		if (energyKj != null) {
			energyKcal = energyKj / 4.184;
		}
	}

	if (energyKcal != null && energyKcal > 0 && calculatedKcal > 0) {
		const mismatch = Math.abs(calculatedKcal - energyKcal) / ((calculatedKcal + energyKcal) / 2);

		if (mismatch > 0.1) {
			return [
				{
					severity: 'warning',
					field: 'all',
					title: 'Energy from macronutrients differs from declared energy by more than 10%',
					desc:
						'Calculated: ' +
						calculatedKcal.toFixed(2) +
						' kcal, declared: ' +
						energyKcal.toFixed(2) +
						' kcal (difference: ' +
						(mismatch * 100).toFixed(2) +
						'%).'
				}
			];
		}
	}
	return [];
};

const sumOfMacroLessThan100g: AnalysisFunc = (product) => {
	const protein = product.nutriments?.['proteins'] ?? 0;
	const carbs = product.nutriments?.['carbohydrates'] ?? 0;
	const fat = product.nutriments?.['fat'] ?? 0;
	const fiber = product.nutriments?.['fibers'] ?? 0;
	const alcohol = product.nutriments?.['alcohol'] ?? 0;
	const salt = product.nutriments?.['salt'] ?? 0;

	const total = protein + carbs + fat + fiber + alcohol + salt;

	if (total > 100) {
		return [
			{
				severity: 'error',
				title: 'Sum of macronutrients exceeds 100g',
				desc:
					`The total of proteins, carbohydrates, fat, fibers, alcohol, and salt is` +
					` ${total.toFixed(2)}g per 100g of product, which exceeds` +
					` the maximum of 100g.`,
				field: 'all'
			}
		];
	}
	return [];
};

const singleFieldLessThan100g: AnalysisFunc = (product) => {
	const issues: Issue[] = [];
	const fields = [
		'proteins',
		'carbohydrates',
		'fat',
		'fibers',
		'alcohol',
		'salt',
		'sugars'
	] as const;
	for (const field of fields) {
		const value = product.nutriments?.[field] ?? 0;
		if (value > 100) {
			issues.push({
				severity: 'error',
				title: `The value of ${field} exceeds 100g`,
				desc: `The amount of ${field} is ${value.toFixed(2)}g per 100g of product, which exceeds the maximum of 100g.`,
				field: field
			});
		}
	}
	return issues;
};

function sugarsLessThanCarbs(product: Product): Issue[] {
	const sugars = product.nutriments?.['sugars'] ?? 0;
	const carbs = product.nutriments?.['carbohydrates'] ?? 0;
	if (sugars > carbs) {
		return [
			{
				title: 'Sugars cannot be greater than total carbohydrates',
				desc:
					`The amount of sugars` +
					` (${sugars.toFixed(2)}g)` +
					` exceeds the total carbohydrates` +
					` (${carbs.toFixed(2)}g)` +
					` per 100g of product.`,
				severity: 'error',
				field: 'sugars'
			}
		];
	}
	return [];
}

const analysisFunctions: AnalysisFunc[] = [
	energyMismatchAnalysis,
	energyFromMacronutrientsAnalysis,
	sumOfMacroLessThan100g,
	singleFieldLessThan100g,
	sugarsLessThanCarbs
];

export function getNutritionIssues(product: Product): Issue[] {
	let issues: Issue[] = [];
	for (const func of analysisFunctions) {
		issues = issues.concat(func(product));
	}
	return issues;
}
