import { describe, it, expect } from 'vitest';
import { parseChartFields } from './search/chart-fields';

describe('parseChartFields', () => {
	it('returns the default charts when the parameter is missing', () => {
		expect(parseChartFields(null)).toEqual([
			'nutrition_grades',
			'environmental_score_grade',
			'nova_group'
		]);
	});

	it('returns no charts when the parameter is empty', () => {
		expect(parseChartFields('')).toEqual([]);
	});

	it('keeps known fields in order', () => {
		expect(parseChartFields('allergens,nutrition_grades')).toEqual([
			'allergens',
			'nutrition_grades'
		]);
	});

	it('drops unknown fields and duplicates', () => {
		expect(parseChartFields('labels,unknown_field,labels,brands')).toEqual(['labels', 'brands']);
	});
});
