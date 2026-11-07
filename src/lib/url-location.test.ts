import { describe, expect, it } from 'vitest';

import { formatUrlLocation, parseUrlLocation, stripUrlLocation } from './url-location';

describe('parseUrlLocation', () => {
	it('parses country followed by language', () => {
		expect(parseUrlLocation('/us-fr/products/123')).toEqual({ country: 'US', language: 'fr' });
	});

	it('accepts world as the worldwide country', () => {
		expect(parseUrlLocation('/world-en/search')).toEqual({ country: 'world', language: 'en' });
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
