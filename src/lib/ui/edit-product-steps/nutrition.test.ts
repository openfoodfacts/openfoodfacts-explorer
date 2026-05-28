import { describe, expect, it } from 'vitest';

import { getServingSizeValidationResult } from './nutrition';

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
