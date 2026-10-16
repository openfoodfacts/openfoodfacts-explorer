import { describe, expect, it } from 'vitest';
import { locationRedirect } from './location-redirect.js';

describe('location redirects', () => {
	it.each([
		['/product/123?foo=bar', 'fr-FR,fr;q=0.9', '/world-fr/product/123?foo=bar'],
		['/search?q=test', '', '/world-en/search?q=test']
	])('redirects %s to a location-prefixed URL', (path, language, expected) => {
		expect(locationRedirect(new URL(path, 'https://example.com'), language)).toBe(expected);
	});

	it.each([
		'/',
		'/world-fr/search',
		'/oauth/login/callback',
		'/oauth/logout/callback',
		'/health',
		'/_app/file.js'
	])('leaves %s unchanged', (path) => {
		expect(locationRedirect(new URL(path, 'https://example.com'), 'fr')).toBeUndefined();
	});
});
