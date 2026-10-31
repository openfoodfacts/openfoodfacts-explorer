import type { Product } from '#lib/api.js';

export type IssueSeverity = 'warning' | 'error';

export type Issue = {
	severity: IssueSeverity;
	field?: string; // e.g., 'energy', 'proteins', 'all', etc.
	title: string;
	desc?: string;
};

type ServingSizeValidationResult = 'valid' | 'missing-number' | 'missing-unit' | 'unknown-unit';

type AnalysisFunc = (product: Product) => Issue[];

// Match numeric tokens so we can inspect the surrounding text for units.
const NUMBER_PATTERN = /\.\d+|\d+(?:[,.]\d+)?/g;
// Match characters that are letters in any language.
const LETTER_PATTERN = /\p{L}/u;

function isLetter(character: string | undefined): boolean {
	return character != null && LETTER_PATTERN.test(character);
}

/**
 * Nutriment values are numbers, but the edit form stores an empty string while a field is being
 * cleared. Normalise both shapes so the checks below never do maths on strings.
 */
function nutrimentNumber(value: unknown): number | null {
	if (value == null || value === '') {
		return null;
	}

	const numeric = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
	return Number.isFinite(numeric) ? numeric : null;
}

function containsKnownUnit(token: string, units: readonly string[]): boolean {
	// Return true when the token contains a known unit as a standalone token.
	for (const unit of units) {
		if (unit === '') {
			continue;
		}

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

export function getServingSizeValidationResult(
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

const energyMismatchAnalysis: AnalysisFunc = (product) => {
	const kcalToKjFactor = 4.184;
	const energyKj = nutrimentNumber(
		product.nutriments?.['energy-kj_100g'] ?? product.nutriments?.['energy_100g']
	);
	const energyKcal = nutrimentNumber(product.nutriments?.['energy-kcal_100g']);

	if (energyKj == null || energyKcal == null) {
		return [];
	}

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
	return [];
};

const energyFromMacronutrientsAnalysis: AnalysisFunc = (product) => {
	const protein = nutrimentNumber(product.nutriments?.['proteins']) ?? 0;
	const carbs = nutrimentNumber(product.nutriments?.['carbohydrates']) ?? 0;
	const fat = nutrimentNumber(product.nutriments?.['fat']) ?? 0;
	const fiber = nutrimentNumber(product.nutriments?.['fibers']) ?? 0;
	const alcohol = nutrimentNumber(product.nutriments?.['alcohol']) ?? 0;

	const calculatedKcal = protein * 4 + carbs * 4 + fat * 9 + fiber * 2 + alcohol * 7;

	let energyKcal = nutrimentNumber(product.nutriments?.['energy-kcal_100g']);
	if (energyKcal == null) {
		const energyKj = nutrimentNumber(
			product.nutriments?.['energy-kj_100g'] ?? product.nutriments?.['energy_100g']
		);
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
	const protein = nutrimentNumber(product.nutriments?.['proteins']) ?? 0;
	const carbs = nutrimentNumber(product.nutriments?.['carbohydrates']) ?? 0;
	const fat = nutrimentNumber(product.nutriments?.['fat']) ?? 0;
	const fiber = nutrimentNumber(product.nutriments?.['fibers']) ?? 0;
	const alcohol = nutrimentNumber(product.nutriments?.['alcohol']) ?? 0;
	const salt = nutrimentNumber(product.nutriments?.['salt']) ?? 0;

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
		'saturated-fat',
		'fibers',
		'alcohol',
		'salt',
		'sodium',
		'sugars'
	] as const;
	for (const field of fields) {
		const value = nutrimentNumber(product.nutriments?.[field]);

		if (value != null && value > 100) {
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
	const sugars = nutrimentNumber(product.nutriments?.['sugars']) ?? 0;
	const carbs = nutrimentNumber(product.nutriments?.['carbohydrates']) ?? 0;
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

const saturatedFatExceedsFatAnalysis: AnalysisFunc = (product) => {
	const saturatedFat = nutrimentNumber(product.nutriments?.['saturated-fat']);
	const fat = nutrimentNumber(product.nutriments?.['fat']);

	if (saturatedFat == null || fat == null || saturatedFat <= fat) {
		return [];
	}

	return [
		{
			severity: 'warning',
			field: 'saturated-fat',
			title: 'Saturated fat cannot be greater than total fat',
			desc:
				`The amount of saturated fat (${saturatedFat.toFixed(2)}g)` +
				` exceeds the total fat (${fat.toFixed(2)}g) per 100g of product.`
		}
	];
};

const saltSodiumMismatchAnalysis: AnalysisFunc = (product) => {
	const salt = nutrimentNumber(product.nutriments?.['salt']);
	const sodium = nutrimentNumber(product.nutriments?.['sodium']);

	if (salt == null || sodium == null || salt <= 0 || sodium <= 0) {
		return [];
	}

	// Salt is roughly 2.5 times the sodium content.
	const expectedSalt = sodium * 2.5;
	const mismatch = Math.abs(expectedSalt - salt) / ((expectedSalt + salt) / 2);

	if (mismatch <= 0.2) {
		return [];
	}

	return [
		{
			severity: 'warning',
			field: 'sodium',
			title: 'Salt and sodium values are inconsistent  salt should be 2.5 times of Na',
			desc:
				`Salt should be about 2.5 times the sodium value.` +
				` ${sodium.toFixed(2)}g of sodium corresponds to about` +
				` ${expectedSalt.toFixed(2)}g of salt, but ${salt.toFixed(2)}g is declared.`
		}
	];
};

const analysisFunctions: AnalysisFunc[] = [
	energyMismatchAnalysis,
	energyFromMacronutrientsAnalysis,
	sumOfMacroLessThan100g,
	singleFieldLessThan100g,
	sugarsLessThanCarbs,
	saturatedFatExceedsFatAnalysis,
	saltSodiumMismatchAnalysis
];

export function getNutritionIssues(product: Product): Issue[] {
	let issues: Issue[] = [];
	for (const func of analysisFunctions) {
		issues = issues.concat(func(product));
	}
	return issues;
}
