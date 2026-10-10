import { describe, expect, it } from 'vitest';
import { getLocaleLabel } from './languages';

describe('getLocaleLabel', () => {
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
