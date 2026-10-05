import { describe, expect, it } from 'vitest';
import { getProductLanguages, resolveProductLanguage } from './productLanguage';

describe('resolveProductLanguage', () => {
	it('uses a valid language code from the query parameter', () => {
		expect(resolveProductLanguage('fr', 'en')).toBe('fr');
	});

	it('normalizes case and whitespace', () => {
		expect(resolveProductLanguage(' DE ', 'en')).toBe('de');
	});

	it('falls back when the parameter is missing', () => {
		expect(resolveProductLanguage(null, 'en')).toBe('en');
		expect(resolveProductLanguage(undefined, 'it')).toBe('it');
		expect(resolveProductLanguage('', 'en')).toBe('en');
	});

	it('falls back when the parameter is not a two-letter code', () => {
		expect(resolveProductLanguage('french', 'en')).toBe('en');
		expect(resolveProductLanguage('f1', 'en')).toBe('en');
		expect(resolveProductLanguage('fr-FR', 'en')).toBe('en');
	});
});

describe('getProductLanguages', () => {
	it('returns an empty list when there are no languages', () => {
		expect(getProductLanguages(undefined)).toEqual([]);
		expect(getProductLanguages({})).toEqual([]);
	});

	it('sorts languages by number of filled fields, then by code', () => {
		expect(getProductLanguages({ en: 3, fr: 5, de: 3 })).toEqual(['fr', 'de', 'en']);
	});

	it('ignores invalid language codes', () => {
		expect(getProductLanguages({ fr: 2, xx_invalid: 4 })).toEqual(['fr']);
	});
});
