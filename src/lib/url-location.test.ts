import { describe, expect, it } from 'vitest';

import { formatUrlLocation, parseUrlLocation, stripUrlLocation } from './url-location';
import { availableLocales } from './i18n/locales';

describe('parseUrlLocation', () => {
	it('parses country followed by language', () => {
		expect(parseUrlLocation('/us-fr/products/123')).toEqual({ country: 'US', language: 'fr' });
	});

	it('accepts world as the worldwide country', () => {
		expect(parseUrlLocation('/world-en/search')).toEqual({ country: 'world', language: 'en' });
	});

	it('accepts kmr as a language', () => {
		expect(parseUrlLocation('/world-kmr/search')).toEqual({ country: 'world', language: 'kmr' });
		expect(parseUrlLocation('/tr-kmr')).toEqual({ country: 'TR', language: 'kmr' });
		expect(parseUrlLocation('/world-xyz')).toBeUndefined();
	});

	it('accepts the language of every available locale', () => {
		for (const locale of availableLocales) {
			const language = locale.split('-')[0].toLowerCase();
			expect(parseUrlLocation(`/world-${language}`)).toEqual({ country: 'world', language });
		}
	});

	it('normalizes valid codes case-insensitively', () => {
		expect(parseUrlLocation('/US-Fr/search')).toEqual({ country: 'US', language: 'fr' });
	});

	it.each([
		'/zz-fr/search',
		'/us-zz/search',
		'/us/search',
		'/world/search',
		'/en-ww/search',
		'/ww-en/search',
		'/'
	])('rejects invalid location prefixes in %s', (pathname) =>
		expect(parseUrlLocation(pathname)).toBeUndefined()
	);
});

describe('formatUrlLocation', () => {
	it('formats country followed by language', () => {
		expect(formatUrlLocation('US', 'FR')).toBe('us-fr');
		expect(formatUrlLocation('world', 'EN')).toBe('world-en');
	});
});

describe('stripUrlLocation', () => {
	it('strips a recognized prefix while preserving the rest of the path', () => {
		expect(stripUrlLocation('/us-fr/products/123')).toBe('/products/123');
		expect(stripUrlLocation('/world-en')).toBe('/');
	});

	it('preserves an unrecognized prefix', () => {
		expect(stripUrlLocation('/zz-zz/products/123')).toBe('/zz-zz/products/123');
	});
});
