import { describe, expect, it } from 'vitest';

import type { Product } from '#lib/api.js';

import { getNutritionIssues, getServingSizeValidationResult, type Issue } from './nutrition';

function productWith(nutriments: Record<string, unknown>): Product {
	return { nutriments } as unknown as Product;
}

function issuesFor(product: Product, field: string): Issue[] {
	return getNutritionIssues(product).filter((issue) => issue.field === field);
}

const units = [
	'g',
	'grammo',
	'克',
	'ml',
	'millilitro',
	'mcg',
	'microgrammo',
	'µg',
	'percent',
	'percento',
	'%'
];

describe('getServingSizeValidationResult', () => {
	it('shows an error when the input has no number at all', () => {
		const issue = getServingSizeValidationResult('large portion', units);

		expect(issue).toBe('missing-number');
	});

	it('shows an error when the input is only a number', () => {
		const issue = getServingSizeValidationResult('100', units);

		expect(issue).toBe('missing-unit');
	});

	it('shows a warning when the number is there but the unit is unknown', () => {
		const issue = getServingSizeValidationResult('1 pcs', units);

		expect(issue).toBe('unknown-unit');
	});

	it('does not let punctuation contribute to identifying an unknown unit', () => {
		const issue = getServingSizeValidationResult('100)', units);

		expect(issue).toBe('missing-unit');
	});

	it('accepts units exposed by the taxonomy regardless of position', () => {
		expect(getServingSizeValidationResult('1 serving (30 g)', units)).toBe('valid');
		expect(getServingSizeValidationResult('1 serving (30 克)', units)).toBe('valid');
		expect(getServingSizeValidationResult('50 µg', units)).toBe('valid');
		expect(getServingSizeValidationResult('250ml', units)).toBe('valid');
		expect(getServingSizeValidationResult('1.5 ml', units)).toBe('valid');
		expect(getServingSizeValidationResult('1,5 ml', units)).toBe('valid');
		expect(getServingSizeValidationResult('10 %', units)).toBe('valid');
		expect(getServingSizeValidationResult('ml 250', units)).toBe('valid');
	});

	it('shows a warning when text does not contain a standalone unit token', () => {
		const issue = getServingSizeValidationResult('1 ggg', units);

		expect(issue).toBe('unknown-unit');
	});

	it('shows no issue for an empty serving size', () => {
		const issue = getServingSizeValidationResult('', units);

		expect(issue).toBe('valid');
	});
});

describe('getNutritionIssues unit handling', () => {
	it('treats a missing unit as grams', () => {
		const product = productWith({ sugars: 116, carbohydrates: 120 });

		expect(issuesFor(product, 'sugars')).toHaveLength(1);
	});

	it('does not flag milligrams as more than 100g', () => {
		const product = productWith({ fat: 500, fat_unit: 'mg', salt: 500, salt_unit: 'mg' });

		expect(issuesFor(product, 'fat')).toEqual([]);
		expect(issuesFor(product, 'salt')).toEqual([]);
	});

	it('does not flag micrograms as more than 100g', () => {
		const product = productWith({ salt: 500000, salt_unit: 'µg' });

		expect(issuesFor(product, 'salt')).toEqual([]);
	});

	it('still flags a value that really exceeds 100g', () => {
		const product = productWith({ salt: 500, salt_unit: 'g' });

		expect(issuesFor(product, 'salt')).toHaveLength(1);
	});

	it('skips macro aggregations when a macro unit cannot be converted', () => {
		const product = productWith({
			proteins: 50,
			proteins_unit: 'oz',
			carbohydrates: 10,
			carbohydrates_unit: 'g',
			'energy-kcal_100g': 10
		});

		expect(issuesFor(product, 'all')).toEqual([]);
	});

	it('sums macros in grams across different units', () => {
		const withinLimit = productWith({
			proteins: 30,
			carbohydrates: 30,
			fat: 30,
			salt: 500,
			salt_unit: 'mg'
		});

		expect(issuesFor(withinLimit, 'all')).toEqual([]);

		const aboveLimit = productWith({
			proteins: 30,
			carbohydrates: 30,
			fat: 30,
			salt: 500,
			salt_unit: 'g'
		});

		expect(issuesFor(aboveLimit, 'all')).toHaveLength(1);
	});

	it('compares sugars and carbohydrates across units', () => {
		expect(
			issuesFor(
				productWith({
					sugars: 6,
					sugars_unit: 'g',
					carbohydrates: 5000,
					carbohydrates_unit: 'mg'
				}),
				'sugars'
			)
		).toHaveLength(1);

		expect(
			issuesFor(
				productWith({
					sugars: 5000,
					sugars_unit: 'mg',
					carbohydrates: 6,
					carbohydrates_unit: 'g'
				}),
				'sugars'
			)
		).toEqual([]);
	});

	describe('alcohol', () => {
		it('converts % vol to grams for the energy check', () => {
			// 5 % vol ≈ 3.945 g of ethanol ≈ 27.615 kcal.
			const product = productWith({
				alcohol: 5,
				alcohol_unit: '% vol',
				'energy-kcal_100g': 27.615
			});

			expect(issuesFor(product, 'all')).toEqual([]);
		});

		it('reports an energy mismatch using the converted alcohol value', () => {
			// Treating the raw 5 as grams would calculate 35 kcal and match the
			// declared energy, so this only passes with the % vol conversion.
			const product = productWith({
				alcohol: 5,
				alcohol_unit: '% vol',
				'energy-kcal_100g': 35
			});

			expect(issuesFor(product, 'all')).toHaveLength(1);
		});

		it('includes alcohol declared as % vol in the macro sum', () => {
			// 98 g of other macros + 3.945 g of alcohol exceeds 100 g.
			const product = productWith({
				carbohydrates: 98,
				alcohol: 5,
				alcohol_unit: '% vol'
			});

			expect(issuesFor(product, 'all')).toHaveLength(1);
		});
	});
});
