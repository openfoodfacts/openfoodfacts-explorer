import { describe, expect, it } from 'vitest';
import { getSortedProductLanguages, resolveProductLanguage } from './productLanguage';

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

describe('getSortedProductLanguages', () => {
	const names: Record<string, string> = {
		de: 'German',
		en: 'English',
		fr: 'French',
		es: 'Spanish'
	};
	const getName = (code: string) => names[code] ?? code;

	it('returns an empty list when there are no languages', () => {
		expect(getSortedProductLanguages(undefined, getName)).toEqual([]);
		expect(getSortedProductLanguages({}, getName)).toEqual([]);
	});

	it('sorts languages alphabetically by display name, not by code or field count', () => {
		const languages = getSortedProductLanguages({ fr: 50, de: 3, en: 10, es: 1 }, getName, 'en');
		expect(languages).toEqual([
			{ code: 'en', name: 'English' },
			{ code: 'fr', name: 'French' },
			{ code: 'de', name: 'German' },
			{ code: 'es', name: 'Spanish' }
		]);
	});

	it('sorts using the given locale', () => {
		const localNames: Record<string, string> = { de: 'Allemand', en: 'Anglais', es: 'Espagnol' };
		const languages = getSortedProductLanguages(
			{ es: 1, en: 1, de: 1 },
			(code) => localNames[code],
			'fr'
		);
		expect(languages.map((l) => l.code)).toEqual(['de', 'en', 'es']);
	});

	it('ignores invalid language codes', () => {
		expect(getSortedProductLanguages({ fr: 2, xx_invalid: 4 }, getName)).toEqual([
			{ code: 'fr', name: 'French' }
		]);
	});
});
