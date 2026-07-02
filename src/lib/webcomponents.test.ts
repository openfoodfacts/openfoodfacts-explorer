import { describe, expect, it } from 'vitest';
import { getPrimaryLanguageCode, setWebcomponentsLanguageCode } from './webcomponents';

describe('getPrimaryLanguageCode', () => {
	it('normalizes locale identifiers to primary language codes', () => {
		expect(getPrimaryLanguageCode('fr-FR')).toBe('fr');
		expect(getPrimaryLanguageCode('zh_CN')).toBe('zh');
		expect(getPrimaryLanguageCode('AB')).toBe('ab');
	});

	it('falls back to English when the language code is missing', () => {
		expect(getPrimaryLanguageCode(undefined)).toBe('en');
		expect(getPrimaryLanguageCode(null)).toBe('en');
		expect(getPrimaryLanguageCode('')).toBe('en');
	});
});

describe('setWebcomponentsLanguageCode', () => {
	it('uses the normalized language code when the webcomponents package accepts it', () => {
		const attributes: [string, string][] = [];
		const config = {
			setAttribute(name: string, value: string) {
				attributes.push([name, value]);
			}
		};

		expect(setWebcomponentsLanguageCode(config, 'fr-FR')).toBe('fr');
		expect(attributes).toEqual([['language-code', 'fr']]);
	});

	it('falls back to English when the webcomponents package rejects a valid OFF language', () => {
		const attributes: [string, string][] = [];
		const config = {
			setAttribute(name: string, value: string) {
				attributes.push([name, value]);
				if (value === 'ab') {
					throw new Error('Invalid language code: ab');
				}
			}
		};

		expect(setWebcomponentsLanguageCode(config, 'ab')).toBe('en');
		expect(attributes).toEqual([
			['language-code', 'ab'],
			['language-code', 'en']
		]);
	});
});
