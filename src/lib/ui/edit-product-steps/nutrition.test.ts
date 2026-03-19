import { describe, expect, it } from 'vitest';

import { getServingSizeIssue } from './nutrition';

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

describe('getServingSizeIssue', () => {
	it('shows an error when the input has no number at all', () => {
		const issue = getServingSizeIssue('large portion', units);

		expect(issue).toMatchObject({
			field: 'serving_size',
			severity: 'error'
		});
	});

	it('shows an error when the input is only a number', () => {
		const issue = getServingSizeIssue('100', units);

		expect(issue).toMatchObject({
			field: 'serving_size',
			severity: 'error'
		});
	});

	it('shows a warning when the number is there but the unit is unknown', () => {
		const issue = getServingSizeIssue('1 pcs', units);

		expect(issue).toMatchObject({
			field: 'serving_size',
			severity: 'warning'
		});
	});

	it('does not let punctuation contribute to identifying an unknown unit', () => {
		const issue = getServingSizeIssue('100)', units);

		expect(issue).toMatchObject({
			field: 'serving_size',
			severity: 'error'
		});
	});

	it('accepts units exposed by the taxonomy regardless of position', () => {
		expect(getServingSizeIssue('1 serving (30 g)', units)).toBeNull();
		expect(getServingSizeIssue('1 serving (30 克)', units)).toBeNull();
		expect(getServingSizeIssue('50 µg', units)).toBeNull();
		expect(getServingSizeIssue('250ml', units)).toBeNull();
		expect(getServingSizeIssue('1.5 ml', units)).toBeNull();
		expect(getServingSizeIssue('1,5 ml', units)).toBeNull();
		expect(getServingSizeIssue('10 %', units)).toBeNull();
		expect(getServingSizeIssue('ml 250', units)).toBeNull();
	});

	it('shows a warning when text does not contain a standalone unit token', () => {
		const issue = getServingSizeIssue('1 ggg', units);

		expect(issue).toMatchObject({
			field: 'serving_size',
			severity: 'warning'
		});
	});

	it('shows no issue for an empty serving size', () => {
		const issue = getServingSizeIssue('', units);

		expect(issue).toBeNull();
	});
});
