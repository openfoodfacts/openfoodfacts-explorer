import { describe, it, expect } from 'vitest';
import { parseChartFields, rejectedChartFields } from './search/chart-fields';

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

describe('rejectedChartFields', () => {
	it('reads every field named in a validation error', () => {
		const error = {
			detail: [
				{
					msg: "Value error, ['Unknown field name in facets/charts: labels', 'Non aggregation field name in facets/charts: brands']"
				}
			]
		};
		expect(rejectedChartFields(error)).toEqual(['labels', 'brands']);
	});

	it('returns nothing for a missing or unrelated error', () => {
		expect(rejectedChartFields(undefined)).toEqual([]);
		expect(rejectedChartFields({ detail: 'Internal Server Error' })).toEqual([]);
	});
});
