import { describe, expect, it } from 'vitest';
import { getCurrencyForCountry } from './country-currency';

describe('getCurrencyForCountry()', () => {
	it('maps a country to its official currency', () => {
		expect(getCurrencyForCountry('fr')).toBe('EUR');
		expect(getCurrencyForCountry('jp')).toBe('JPY');
	});

	it('maps countries sharing a currency union', () => {
		expect(getCurrencyForCountry('de')).toBe('EUR');
		expect(getCurrencyForCountry('sn')).toBe('XOF');
	});

	it('accepts upper-case country codes', () => {
		expect(getCurrencyForCountry('FR')).toBe('EUR');
	});

	it('returns undefined for world and unknown codes', () => {
		expect(getCurrencyForCountry('world')).toBeUndefined();
		expect(getCurrencyForCountry('zz')).toBeUndefined();
	});
});
