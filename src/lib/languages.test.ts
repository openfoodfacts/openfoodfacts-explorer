import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getLocaleLabel } from './languages';

const displayNames: Record<string, Record<string, string>> = {
	'en:language': {
		hi: 'Hindi',
		fr: 'French',
		de: 'German',
		en: 'English',
		es: 'Spanish',
		zh: 'Chinese'
	},
	'hi:language': { hi: 'हिन्दी' },
	'fr:language': { fr: 'français' },
	'de:language': { de: 'Deutsch' },
	'es:language': { es: 'español' },
	'zh:language': { zh: '中文' },
	'en:region': { US: 'United States', FR: 'France', CN: 'China', '419': 'Latin America' },
	'fr:region': { FR: 'France' },
	'es:region': { '419': 'Latinoamérica' },
	'zh:region': { CN: '中国' }
};

describe('getLocaleLabel', () => {
	beforeEach(() => {
		vi.spyOn(Intl, 'DisplayNames').mockImplementation(function (locales, options) {
			const locale = Array.isArray(locales) ? String(locales[0]) : String(locales);
			const names = displayNames[`${locale}:${options.type}`] ?? {};

			return {
				of: (code: string) => names[code]
			} as Intl.DisplayNames;
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('shows the English name, then the name in that language', () => {
		expect(getLocaleLabel('hi')).toBe('Hindi (हिन्दी)');
		expect(getLocaleLabel('fr')).toBe('French (français)');
		expect(getLocaleLabel('de')).toBe('German (Deutsch)');
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
		).toBe('French (Français)');
	});

	it('includes the region for locale codes', () => {
		expect(getLocaleLabel('en-US')).toBe('English (United States)');
		expect(getLocaleLabel('en_US')).toBe('English (United States)');
		expect(getLocaleLabel('en-us')).toBe('English (United States)');
		expect(getLocaleLabel('es-419')).toBe('Spanish (Latin America) (español (Latinoamérica))');
		expect(getLocaleLabel('fr-FR')).toBe('French (France) (français (France))');
		expect(getLocaleLabel('zh-Hans-CN')).toBe('Chinese (China) (中文 (中国))');
	});
});
