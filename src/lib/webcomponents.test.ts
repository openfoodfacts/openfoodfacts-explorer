import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	getPrimaryLanguageCode,
	getSupportedWebcomponentsLanguageCode,
	SUPPORTED_WEBCOMPONENTS_LANGUAGE_CODES,
	setWebcomponentsLanguageCode
} from './webcomponents';

const require = createRequire(import.meta.url);

function getPackagedWebcomponentsLanguageCodes(): string[] {
	const webcomponentsBundlePath = require.resolve('@openfoodfacts/openfoodfacts-webcomponents');
	const webcomponentsLangDirectory = join(dirname(webcomponentsBundlePath), 'lang');

	return [
		...new Set(
			readdirSync(webcomponentsLangDirectory)
				.map((fileName) => fileName.match(/^([a-z]+)-/)?.[1])
				.filter((languageCode): languageCode is string => languageCode != null)
		)
	].sort();
}

describe('SUPPORTED_WEBCOMPONENTS_LANGUAGE_CODES', () => {
	it('matches the packaged webcomponents locales', () => {
		expect([...SUPPORTED_WEBCOMPONENTS_LANGUAGE_CODES].sort()).toEqual(
			getPackagedWebcomponentsLanguageCodes()
		);
	});
});

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

describe('getSupportedWebcomponentsLanguageCode', () => {
	it('uses the normalized language code when webcomponents support it', () => {
		expect(getSupportedWebcomponentsLanguageCode('fr-FR')).toBe('fr');
		expect(getSupportedWebcomponentsLanguageCode('pt_BR')).toBe('pt');
	});

	it('falls back to English when webcomponents do not support the language code', () => {
		expect(getSupportedWebcomponentsLanguageCode('ab')).toBe('en');
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

	it('falls back to English before setting an unsupported webcomponents language', () => {
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
		expect(attributes).toEqual([['language-code', 'en']]);
	});
});
