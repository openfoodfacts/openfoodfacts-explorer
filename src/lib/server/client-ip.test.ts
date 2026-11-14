import { describe, expect, it, vi } from 'vitest';
import { withClientIp } from './client-ip.js';

const trustedOrigins = new Set([
	'https://world.openfoodfacts.org',
	'https://world.openfoodfacts.net'
]);

describe('withClientIp', () => {
	it('uses the configured origins', () => {
		const request = new Request('https://api.example.org/data');
		const result = withClientIp(request, () => '192.0.2.42', new Set(['https://api.example.org']));
		expect(result.headers.get('x-real-ip')).toBe('192.0.2.42');
	});
	it.each(['https://world.openfoodfacts.org/api', 'https://world.openfoodfacts.net/api'])(
		'forwards the client IP to %s',
		(url) => {
			const request = new Request(url, { headers: { 'x-real-ip': 'spoofed' } });
			const result = withClientIp(request, () => '192.0.2.42', trustedOrigins);
			expect(result.headers.get('x-real-ip')).toBe('192.0.2.42');
			expect(result.redirect).toBe('error');
		}
	);

	it.each([
		'https://world.openfoodfacts.org.evil.example/api',
		'https://world.openfoodfacts.org:444/api',
		'http://world.openfoodfacts.org/api',
		'https://example.org/api'
	])('does not forward the address to %s', (url) => {
		const getClientAddress = vi.fn(() => '192.0.2.42');
		const request = new Request(url);
		expect(withClientIp(request, getClientAddress, trustedOrigins)).toBe(request);
		expect(getClientAddress).not.toHaveBeenCalled();
	});

	it('removes a supplied header when no client address is available', () => {
		const request = new Request('https://world.openfoodfacts.org/api', {
			headers: { 'x-real-ip': 'spoofed' }
		});
		const result = withClientIp(
			request,
			() => {
				throw new Error('unavailable');
			},
			trustedOrigins
		);
		expect(result.headers.has('x-real-ip')).toBe(false);
	});
});
