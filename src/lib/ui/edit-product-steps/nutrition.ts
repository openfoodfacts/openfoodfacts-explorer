import type { Product } from '$lib/api';

type AnalysisResult = {
	severity: 'warning' | 'error';
	field?: string; // e.g., 'energy', 'proteins', 'all', etc.
	title: string;
	desc?: string;
};

type AnalysisFunc = (product: Product) => AnalysisResult[];

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
	const results: AnalysisResult[] = [];
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
			results.push({
				severity: 'error',
				title: `The value of ${field} exceeds 100g`,
				desc: `The amount of ${field} is ${value.toFixed(2)}g per 100g of product, which exceeds the maximum of 100g.`,
				field: field
			});
		}
	}
	return results;
};

function sugarsLessThanCarbs(product: Product): AnalysisResult[] {
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

export function analyzeNutrition(product: Product): AnalysisResult[] {
	let results: AnalysisResult[] = [];
	for (const func of analysisFunctions) {
		results = results.concat(func(product));
	}
	return results;
}
