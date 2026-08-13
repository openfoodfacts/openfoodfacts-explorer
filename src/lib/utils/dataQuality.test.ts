import { describe, expect, it } from 'vitest';
import { getQualityErrors } from './dataQuality';

describe('getQualityErrors', () => {
	it('returns an empty array when no error, warning, or info tags are provided', () => {
		expect(getQualityErrors()).toEqual([]);
		expect(getQualityErrors([], [], [])).toEqual([]);
	});

	it('correctly maps exact error tags from QUALITY_ERRORS_MAP', () => {
		const errors = ['en:nutrition-sugars-plus-starch-greater-than-carbohydrates'];
		const result = getQualityErrors(errors);

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			tag: 'en:nutrition-sugars-plus-starch-greater-than-carbohydrates',
			field: 'sugars_100g',
			section: 'nutrition',
			message: 'product.edit.quality.sugars_gt_carbs',
			severity: 'error'
		});
	});

	it('normalizes non-English language prefixes to en: and maps them correctly', () => {
		const warnings = ['fr:nutrition-energy-value-in-kcal-does-not-match-value-in-kj'];
		const result = getQualityErrors(undefined, warnings);

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			tag: 'fr:nutrition-energy-value-in-kcal-does-not-match-value-in-kj',
			field: 'energy_100g',
			section: 'nutrition',
			message: 'product.edit.quality.energy_kcal_kj_mismatch',
			severity: 'warning'
		});
	});

	it('handles dynamic negative nutrient value matches', () => {
		const errors = ['value-negative-fat'];
		const result = getQualityErrors(errors);

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			tag: 'value-negative-fat',
			field: 'fat_100g',
			section: 'nutrition',
			message: 'product.edit.quality.value_negative',
			severity: 'error'
		});
	});

	it('handles dynamic value-over-105 nutrient matches', () => {
		const errors = ['value-over-105-sugars'];
		const result = getQualityErrors(errors);

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			tag: 'value-over-105-sugars',
			field: 'sugars_100g',
			section: 'nutrition',
			message: 'product.edit.quality.value_over_105',
			severity: 'error'
		});
	});

	it('handles dynamic value-over-1000 nutrient matches', () => {
		const warnings = ['value-over-1000-salt'];
		const result = getQualityErrors(undefined, warnings);

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			tag: 'value-over-1000-salt',
			field: 'salt_100g',
			section: 'nutrition',
			message: 'product.edit.quality.value_over_1000',
			severity: 'warning'
		});
	});

	it('correctly processes error, warning, and info lists simultaneously', () => {
		const errors = ['en:nutrition-saturated-fat-greater-than-fat'];
		const warnings = ['en:nutrition-energy-value-in-kcal-does-not-match-value-in-kj'];
		const infos = ['value-negative-carbohydrates'];

		const result = getQualityErrors(errors, warnings, infos);

		expect(result).toHaveLength(3);
		expect(result[0].severity).toBe('error');
		expect(result[1].severity).toBe('warning');
		expect(result[2].severity).toBe('info');
	});

	it('safely ignores unrecognized tags that do not match any pattern', () => {
		const errors = ['en:unknown-fake-quality-tag-xyz'];
		const result = getQualityErrors(errors);

		expect(result).toEqual([]);
	});
});
