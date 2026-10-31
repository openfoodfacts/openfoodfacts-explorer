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
	it('compares salt and sodium in grams, not raw numbers', () => {
		const product = productWith({ salt: 1, salt_unit: 'g', sodium: 400, sodium_unit: 'mg' });

		expect(issuesFor(product, 'sodium')).toEqual([]);
	});

	it('still reports a real salt and sodium mismatch', () => {
		const product = productWith({ salt: 5, salt_unit: 'g', sodium: 400, sodium_unit: 'mg' });

		expect(issuesFor(product, 'sodium')).toHaveLength(1);
	});

	it('compares saturated fat and fat in grams, not raw numbers', () => {
		const product = productWith({
			fat: 1,
			fat_unit: 'g',
			'saturated-fat': 500,
			'saturated-fat_unit': 'mg'
		});

		expect(issuesFor(product, 'saturated-fat').filter((i) => /saturated/i.test(i.title))).toEqual(
			[]
		);
	});

	it('still reports saturated fat above total fat', () => {
		const product = productWith({
			fat: 30,
			fat_unit: 'g',
			'saturated-fat': 50,
			'saturated-fat_unit': 'g'
		});

		expect(issuesFor(product, 'saturated-fat')).toHaveLength(1);
	});

	it('handles micrograms when converting to grams', () => {
		const product = productWith({
			fat: 0.001,
			fat_unit: 'g',
			'saturated-fat': 500,
			'saturated-fat_unit': 'µg'
		});

		expect(issuesFor(product, 'saturated-fat')).toEqual([]);
	});

	it('does not flag milligrams as more than 100g', () => {
		const product = productWith({ sodium: 500, sodium_unit: 'mg', fat: 500, fat_unit: 'mg' });

		expect(issuesFor(product, 'sodium').filter((i) => /100g/.test(i.title))).toEqual([]);
		expect(issuesFor(product, 'fat').filter((i) => /100g/.test(i.title))).toEqual([]);
	});

	it('still flags a value that really exceeds 100g', () => {
		const product = productWith({ sodium: 500, sodium_unit: 'g' });

		expect(issuesFor(product, 'sodium')).toHaveLength(1);
	});
});
