import { describe, expect, it } from 'vitest';
import { resolveDomain } from '#lib/metadata.js';

describe('resolveDomain', () => {
	it('extracts hostname from an absolute url', () => {
		expect(resolveDomain('https://beta.openfoodfacts.net/product/123')).toBe(
			'beta.openfoodfacts.net'
		);
	});

	it('resolves relative url against fallback url', () => {
		expect(resolveDomain('/product/123', 'https://openfoodfacts-explorer.vercel.app')).toBe(
			'openfoodfacts-explorer.vercel.app'
		);
	});

	it('falls back to fallbackUrl hostname when url is empty', () => {
		expect(resolveDomain('', 'https://world.openfoodfacts.org/explore')).toBe(
			'world.openfoodfacts.org'
		);
	});

	it('returns overrideDomain directly when provided', () => {
		expect(
			resolveDomain('https://beta.openfoodfacts.net/product/123', undefined, 'custom.domain.com')
		).toBe('custom.domain.com');
	});

	it('handles URL object inputs', () => {
		const base = new URL('https://beta.openfoodfacts.net/search');
		expect(resolveDomain('/facets', base)).toBe('beta.openfoodfacts.net');
	});

	it('returns empty string when no valid URL is resolvable', () => {
		expect(resolveDomain('invalid-relative-url-without-base')).toBe('');
	});
});
