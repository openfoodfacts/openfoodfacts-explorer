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

const GRAMS_PER_UNIT: Record<string, number> = {
	g: 1,
	mg: 1e-3,
	µg: 1e-6,
	ug: 1e-6,
	mcg: 1e-6,
	μg: 1e-6
};

type GramAmount = { kind: 'grams'; grams: number } | { kind: 'missing' } | { kind: 'unknown-unit' };

/**
 * Nutriment values are stored as typed, while the chosen unit lives in `<nutrient>_unit`.
 * Checks that compare amounts must do it in grams, so convert through the stored unit first.
 *
 * A missing unit means grams, which is how the edit form stores nutrients by default. A unit we
 * cannot convert is reported as `unknown-unit` so callers skip the comparison, instead of
 * validating the raw number as if it were already in grams.
 */
function gramAmount(product: Product, field: string): GramAmount {
	const nutriments = product.nutriments as Record<string, unknown> | undefined;
	const value = nutrimentNumber(nutriments?.[field]);

	if (value == null) {
		return { kind: 'missing' };
	}

	const rawUnit = String(nutriments?.[`${field}_unit`] ?? '')
		.trim()
		.toLowerCase()
		.replace('μ', 'µ');
	const factor = rawUnit === '' ? 1 : GRAMS_PER_UNIT[rawUnit];

	if (factor == null) {
		return { kind: 'unknown-unit' };
	}

	return { kind: 'grams', grams: value * factor };
}

/**
 * Gram amounts for a group of fields, or `null` when any of them uses a unit we cannot convert.
 * Missing values count as zero, which is how the aggregate checks have always treated them.
 */
function allGramAmounts(
	product: Product,
	fields: readonly string[]
): Record<string, number> | null {
	const amounts: Record<string, number> = {};

	for (const field of fields) {
		const amount = gramAmount(product, field);

		if (amount.kind === 'unknown-unit') {
			return null;
		}

		amounts[field] = amount.kind === 'grams' ? amount.grams : 0;
	}

	return amounts;
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
	const macros = allGramAmounts(product, ['proteins', 'carbohydrates', 'fat', 'fibers', 'alcohol']);

	// A macro with an unknown unit makes the calculated energy meaningless.
	if (macros == null) {
		return [];
	}

	const calculatedKcal =
		macros.proteins * 4 +
		macros.carbohydrates * 4 +
		macros.fat * 9 +
		macros.fibers * 2 +
		macros.alcohol * 7;

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
	const macros = allGramAmounts(product, [
		'proteins',
		'carbohydrates',
		'fat',
		'fibers',
		'alcohol',
		'salt'
	]);

	// A macro with an unknown unit makes the total unreliable, so do not report a false error.
	if (macros == null) {
		return [];
	}

	const total =
		macros.proteins +
		macros.carbohydrates +
		macros.fat +
		macros.fibers +
		macros.alcohol +
		macros.salt;

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
		const amount = gramAmount(product, field);

		if (amount.kind !== 'grams' || amount.grams <= 100) {
			continue;
		}

		issues.push({
			severity: 'error',
			title: `The value of ${field} exceeds 100g`,
			desc: `The amount of ${field} is ${amount.grams.toFixed(2)}g per 100g of product, which exceeds the maximum of 100g.`,
			field: field
		});
	}
	return issues;
};

function sugarsLessThanCarbs(product: Product): Issue[] {
	const sugars = gramAmount(product, 'sugars');
	const carbs = gramAmount(product, 'carbohydrates');

	if (sugars.kind !== 'grams' || carbs.kind !== 'grams' || sugars.grams <= carbs.grams) {
		return [];
	}

	return [
		{
			title: 'Sugars cannot be greater than total carbohydrates',
			desc:
				`The amount of sugars` +
				` (${sugars.grams.toFixed(2)}g)` +
				` exceeds the total carbohydrates` +
				` (${carbs.grams.toFixed(2)}g)` +
				` per 100g of product.`,
			severity: 'error',
			field: 'sugars'
		}
	];
}

const saturatedFatExceedsFatAnalysis: AnalysisFunc = (product) => {
	const saturatedFat = gramAmount(product, 'saturated-fat');
	const fat = gramAmount(product, 'fat');

	if (saturatedFat.kind !== 'grams' || fat.kind !== 'grams' || saturatedFat.grams <= fat.grams) {
		return [];
	}

	return [
		{
			severity: 'warning',
			field: 'saturated-fat',
			title: 'Saturated fat cannot be greater than total fat',
			desc:
				`The amount of saturated fat (${saturatedFat.grams.toFixed(2)}g)` +
				` exceeds the total fat (${fat.grams.toFixed(2)}g) per 100g of product.`
		}
	];
};

const saltSodiumMismatchAnalysis: AnalysisFunc = (product) => {
	const salt = gramAmount(product, 'salt');
	const sodium = gramAmount(product, 'sodium');

	if (salt.kind !== 'grams' || sodium.kind !== 'grams' || salt.grams <= 0 || sodium.grams <= 0) {
		return [];
	}

	// Salt is roughly 2.5 times the sodium content.
	const expectedSalt = sodium.grams * 2.5;
	const mismatch = Math.abs(expectedSalt - salt.grams) / ((expectedSalt + salt.grams) / 2);

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
				` ${sodium.grams.toFixed(2)}g of sodium corresponds to about` +
				` ${expectedSalt.toFixed(2)}g of salt, but ${salt.grams.toFixed(2)}g is declared.`
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
