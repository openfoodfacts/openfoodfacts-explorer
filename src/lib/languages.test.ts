import { describe, expect, it } from 'vitest';
import { getLocaleLabel } from './languages';

describe('getLocaleLabel', () => {
	it('shows the name in that language and the English name', () => {
		expect(getLocaleLabel('hi')).toBe('हिन्दी — Hindi');
		expect(getLocaleLabel('fr')).toBe('français — French');
		expect(getLocaleLabel('de')).toBe('Deutsch — German');
	});

	it('shows a single name when the endonym and English name match', () => {
		expect(getLocaleLabel('en')).toBe('English');
	});

	it('prefers taxonomy names over Intl', () => {
		expect(
			getLocaleLabel('fr', [
				{
					language_code_2: { en: 'fr' },
					name: { en: 'French', fr: 'Français' }
				}
			])
		).toBe('Français — French');
	});

	it('includes the region for locale codes', () => {
		expect(getLocaleLabel('en-US')).toBe('English (United States)');
		expect(getLocaleLabel('en_US')).toBe('English (United States)');
		expect(getLocaleLabel('fr-FR')).toBe('français (France) — French (France)');
	});
});
