import { describe, expect, it } from 'vitest';
import { isHttpUrl } from './utils';

describe('isHttpUrl', () => {
	it('accepts http and https links', () => {
		expect(isHttpUrl('https://world.openfoodfacts.org/editor/foo')).toBe(true);
		expect(isHttpUrl('http://example.org')).toBe(true);
	});

	it('rejects other schemes, relative links and missing values', () => {
		expect(isHttpUrl('javascript:alert(1)')).toBe(false);
		expect(isHttpUrl('data:text/html,hi')).toBe(false);
		expect(isHttpUrl('/product/123')).toBe(false);
		expect(isHttpUrl('')).toBe(false);
		expect(isHttpUrl(undefined)).toBe(false);
	});
});
