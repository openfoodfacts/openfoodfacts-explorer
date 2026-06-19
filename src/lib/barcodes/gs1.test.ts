import { describe, it, expect } from 'vitest';
import { Gs1Barcode } from './gs1';

describe('Gs1Barcode.parse()', () => {
	describe('valid barcodes', () => {
		it('parses EAN-13', () => {
			const barcode = Gs1Barcode.parse('3123456789019');
			expect(barcode).not.toBeNull();
			expect(barcode!.code).toBe('3123456789019');
			expect(barcode!.gtin).toBe('03123456789019');
			expect(barcode!.variant).toBe('GTIN-13');
			expect(barcode!.isEAN13()).toBe(true);
			expect(barcode!.isUPC()).toBe(false);
		});

		it('parses EAN-13 (5000159484695)', () => {
			const barcode = Gs1Barcode.parse('5000159484695');
			expect(barcode).not.toBeNull();
			expect(barcode!.code).toBe('5000159484695');
			expect(barcode!.gtin).toBe('05000159484695');
			expect(barcode!.variant).toBe('GTIN-13');
			expect(barcode!.isEAN13()).toBe(true);
		});

		it('parses EAN-13 (4006381333931)', () => {
			const barcode = Gs1Barcode.parse('4006381333931');
			expect(barcode).not.toBeNull();
			expect(barcode!.code).toBe('4006381333931');
			expect(barcode!.gtin).toBe('04006381333931');
			expect(barcode!.variant).toBe('GTIN-13');
		});

		it('parses UPC-A (GTIN-12)', () => {
			const barcode = Gs1Barcode.parse('012345678905');
			expect(barcode).not.toBeNull();
			expect(barcode!.code).toBe('012345678905');
			expect(barcode!.gtin).toBe('00012345678905');
			expect(barcode!.variant).toBe('GTIN-12');
			expect(barcode!.isUPC()).toBe(true);
			expect(barcode!.isEAN13()).toBe(false);
		});

		it('parses EAN-8 (GTIN-8)', () => {
			const barcode = Gs1Barcode.parse('96385074');
			expect(barcode).not.toBeNull();
			expect(barcode!.code).toBe('96385074');
			expect(barcode!.gtin).toBe('00000096385074');
			expect(barcode!.variant).toBe('GTIN-8');
		});

		it('parses GTIN-14', () => {
			const barcode = Gs1Barcode.parse('00012345678905');
			expect(barcode).not.toBeNull();
			expect(barcode!.code).toBe('00012345678905');
			expect(barcode!.gtin).toBe('00012345678905');
			expect(barcode!.variant).toBe('GTIN-14');
		});
	});

	describe('GS1 Digital Link', () => {
		it('extracts GTIN from a digital link with query params', () => {
			const barcode = Gs1Barcode.parse('https://example.com/01/00012345678905?other=stuff');
			expect(barcode).not.toBeNull();
			expect(barcode!.code).toBe('00012345678905');
			expect(barcode!.gtin).toBe('00012345678905');
		});

		it('extracts GTIN from a digital link with additional path segments', () => {
			const barcode = Gs1Barcode.parse('https://example.com/01/5000159484695/10/ABC');
			expect(barcode).not.toBeNull();
			expect(barcode!.code).toBe('5000159484695');
			expect(barcode!.gtin).toBe('05000159484695');
		});
	});

	describe('invalid input', () => {
		it('rejects too-short digits', () => {
			expect(Gs1Barcode.parse('12345')).toBeNull();
		});

		it('rejects wrong-length digits with valid-looking content', () => {
			expect(Gs1Barcode.parse('123456789013')).toBeNull();
		});

		it('rejects EAN-13 with wrong checksum', () => {
			// 3123456789019 has valid checksum; last digit 2 makes it invalid
			expect(Gs1Barcode.parse('3123456789012')).toBeNull();
		});

		it('rejects non-numeric string', () => {
			expect(Gs1Barcode.parse('not-a-barcode')).toBeNull();
		});

		it('rejects empty string', () => {
			expect(Gs1Barcode.parse('')).toBeNull();
		});

		it('rejects a URL that is not a GS1 Digital Link', () => {
			expect(Gs1Barcode.parse('https://example.com/product/123')).toBeNull();
		});
	});
});
