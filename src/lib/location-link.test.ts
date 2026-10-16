import { describe, expect, it } from 'vitest';

import { withLocationPrefix } from './location-link';

describe('withLocationPrefix', () => {
	const location = { language: 'fr', country: 'world' };

	it('adds the location prefix to internal paths', () => {
		expect(withLocationPrefix('/products/123', location)).toBe('/fr-ww/products/123');
		expect(withLocationPrefix('/', location)).toBe('/fr-ww');
	});

	it('leaves external and protocol-relative URLs unchanged', () => {
		expect(withLocationPrefix('https://example.com/path', location)).toBe(
			'https://example.com/path'
		);
		expect(withLocationPrefix('//example.com/path', location)).toBe('//example.com/path');
	});

	it('leaves paths unchanged when no location is available', () => {
		expect(withLocationPrefix('/products/123')).toBe('/products/123');
	});
});
