import { describe, expect, it } from 'vitest';

import { toCsv } from './csv';
import { productToCsvRow, productsToCsv, SEARCH_CSV_HEADERS } from './searchCsvExport';

describe('toCsv', () => {
	it('builds a CRLF CSV with a trailing newline', async () => {
		expect(await toCsv(['a', 'b'], [['1', '2']])).toBe('a,b\r\n1,2\r\n');
	});

	it('quotes values containing commas, quotes, or newlines', async () => {
		expect(await toCsv(['h'], [['a,b']])).toBe('h\r\n"a,b"\r\n');
		expect(await toCsv(['h'], [['say "hi"']])).toBe('h\r\n"say ""hi"""\r\n');
		expect(await toCsv(['h'], [['line1\nline2']])).toBe('h\r\n"line1\nline2"\r\n');
	});

	it('escapes formula-like values to prevent CSV injection', async () => {
		expect(await toCsv(['h'], [['=1+1']])).toBe("h\r\n'=1+1\r\n");
		expect(await toCsv(['h'], [['+cmd']])).toBe("h\r\n'+cmd\r\n");
		expect(await toCsv(['h'], [['-2+2']])).toBe("h\r\n'-2+2\r\n");
		expect(await toCsv(['h'], [['@SUM(A1)']])).toBe("h\r\n'@SUM(A1)\r\n");
		expect(await toCsv(['h'], [[null, undefined]])).toBe('h\r\n,\r\n');
	});
});

describe('productToCsvRow', () => {
	it('maps product fields and nutriments to the default columns', async () => {
		const row = productToCsvRow({
			code: '3017620422003',
			product_name: 'Nutella',
			brands: 'Ferrero',
			quantity: '400 g',
			categories: 'Spreads, Hazelnut spreads',
			countries: 'France, Germany',
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
			'Spreads, Hazelnut spreads',
			'France, Germany',
			'/products/3017620422003',
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
			await productsToCsv([
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
