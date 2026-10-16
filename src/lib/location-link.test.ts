import { describe, expect, it } from 'vitest';

import { withLocationPrefix } from './location-link';

describe('withLocationPrefix', () => {
	const location = { language: 'fr', country: 'world' };

	it('adds the location prefix to internal paths', () => {
		expect(withLocationPrefix('/products/123', location)).toBe('/world-fr/products/123');
		expect(withLocationPrefix('/', location)).toBe('/world-fr');
	});

	it('leaves external and protocol-relative URLs unchanged', () => {
		expect(withLocationPrefix('https://example.com/path', location)).toBe(
			'https://example.com/path'
		);
		expect(withLocationPrefix('//example.com/path', location)).toBe('//example.com/path');
	});

	it('resolves server-rendered relative paths before adding the location', () => {
		expect(
			withLocationPrefix('../facets/countries?sort=name#top', location, '/world-fr/facets')
		).toBe('/world-fr/facets/countries?sort=name#top');
		expect(withLocationPrefix('../', location, '/world-fr/facets')).toBe('/world-fr');
	});

	it('leaves paths unchanged when no location is available', () => {
		expect(withLocationPrefix('/products/123')).toBe('/products/123');
	});
});
