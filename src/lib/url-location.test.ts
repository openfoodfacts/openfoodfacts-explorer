import { describe, expect, it } from 'vitest';

import { formatUrlLocation, parseUrlLocation, stripUrlLocation } from './url-location';

describe('parseUrlLocation', () => {
	it('parses language and country prefixes', () => {
		expect(parseUrlLocation('/fr-fr/products/123')).toEqual({ language: 'fr', country: 'FR' });
	});

	it('allows the world country exception with or without a language', () => {
		expect(parseUrlLocation('/en-ww/search')).toEqual({ language: 'en', country: 'world' });
		expect(parseUrlLocation('/ww/search')).toEqual({ country: 'world' });
	});

	it('normalizes valid codes case-insensitively', () => {
		expect(parseUrlLocation('/EN-us/search')).toEqual({ language: 'en', country: 'US' });
	});

	it.each(['/zz-zz/search', '/zz-fr/search', '/en-zz/search', '/eng-us/search', '/'])(
		'rejects invalid location prefixes in %s',
		(pathname) => {
			expect(parseUrlLocation(pathname)).toBeUndefined();
		}
	);
});

describe('formatUrlLocation', () => {
	it('formats a language and world location', () => {
		expect(formatUrlLocation('EN', 'world')).toBe('en-ww');
	});

	it('formats a country-only location', () => {
		expect(formatUrlLocation(undefined, 'FR')).toBe('fr');
	});
});

describe('stripUrlLocation', () => {
	it('strips a recognized prefix while preserving the rest of the path', () => {
		expect(stripUrlLocation('/fr-fr/products/123')).toBe('/products/123');
		expect(stripUrlLocation('/ww')).toBe('/');
	});

	it('preserves an unrecognized prefix', () => {
		expect(stripUrlLocation('/zz-zz/products/123')).toBe('/zz-zz/products/123');
	});
});
