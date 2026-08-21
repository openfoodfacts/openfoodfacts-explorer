import { describe, expect, it } from 'vitest';

import { escapeCsvValue, toCsv } from './csv';
import { productToCsvRow, productsToCsv, SEARCH_CSV_HEADERS } from './searchCsvExport';

describe('escapeCsvValue', () => {
	it('returns empty string for nullish values', () => {
		expect(escapeCsvValue(null)).toBe('');
		expect(escapeCsvValue(undefined)).toBe('');
	});

	it('quotes values containing commas, quotes, or newlines', () => {
		expect(escapeCsvValue('a,b')).toBe('"a,b"');
		expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""');
		expect(escapeCsvValue('line1\nline2')).toBe('"line1\nline2"');
	});

	it('prefixes formula-like strings to prevent CSV injection', () => {
		expect(escapeCsvValue('=1+1')).toBe("'=1+1");
		expect(escapeCsvValue('+cmd')).toBe("'+cmd");
		expect(escapeCsvValue('-2+2')).toBe("'-2+2");
		expect(escapeCsvValue('@SUM(A1)')).toBe("'@SUM(A1)");
		expect(escapeCsvValue('  =1+1')).toBe("'  =1+1");
		expect(escapeCsvValue(-5)).toBe('-5');
	});
});

describe('toCsv', () => {
	it('builds a CRLF CSV with a trailing newline', () => {
		expect(toCsv(['a', 'b'], [['1', '2']])).toBe('a,b\r\n1,2\r\n');
	});
});

describe('productToCsvRow', () => {
	it('maps product fields and nutriments to the default columns', () => {
		const row = productToCsvRow({
			code: '3017620422003',
			product_name: 'Nutella',
			brands: 'Ferrero',
			quantity: '400 g',
			nutriscore_grade: 'e',
			environmental_score_grade: 'd',
			nova_group: 4,
			nutriments: {
				'energy-kcal_100g': 539,
				fat_100g: 30.9,
				'saturated-fat_100g': 10.6,
				carbohydrates_100g: 57.5,
				sugars_100g: 56.3,
				fiber_100g: 0,
				proteins_100g: 6.3,
				salt_100g: 0.107
			}
		});

		expect(row).toEqual([
			'3017620422003',
			'Nutella',
			'Ferrero',
			'400 g',
			'e',
			'd',
			4,
			539,
			30.9,
			10.6,
			57.5,
			56.3,
			0,
			6.3,
			0.107
		]);
		expect(SEARCH_CSV_HEADERS).toHaveLength(row.length);
		expect(
			productsToCsv([
				{
					code: '1',
					product_name: 'A, B',
					brands: 'Brand',
					nutriments: {}
				}
			])
		).toContain('"A, B"');
	});
});
