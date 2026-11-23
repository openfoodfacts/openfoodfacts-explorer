import { describe, expect, it } from 'vitest';
import { getLocaleForUrl } from './index.js';

describe('URL locale', () => {
	it('preserves a preferred regional locale matching the URL language', () => {
		expect(getLocaleForUrl(new URL('https://example.com/world-pt/settings'), 'pt-PT')).toBe(
			'pt-PT'
		);
	});

	it('does not use a preference for a different language', () => {
		expect(getLocaleForUrl(new URL('https://example.com/world-fr/settings'), 'pt-PT')).toBe('fr');
	});
});
