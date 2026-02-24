import { describe, it, expect, vi } from 'vitest';
import { formBody, wrapFetchWithCredentials } from '../utils';

describe('formBody', () => {
	it('should filter out null and undefined values', () => {
		const params = {
			a: '1',
			b: null,
			c: undefined,
			d: '2'
		};
		const result = formBody(params);
		expect(result.get('a')).toBe('1');
		expect(result.get('d')).toBe('2');
		expect(result.has('b')).toBe(false);
		expect(result.has('c')).toBe(false);
		expect(Array.from(result.keys())).toHaveLength(2);
	});
});

describe('wrapFetchWithCredentials', () => {
	it('should return the original fetch and URL if no credentials are provided', () => {
		const url = new URL('https://example.com/api');
		const mockFetch = vi.fn() as any;
		const result = wrapFetchWithCredentials(mockFetch, url);

		expect(result.fetch).toBe(mockFetch);
		expect(result.url.toString()).toBe('https://example.com/api');
	});

	it('should wrap fetch and remove credentials from URL if valid credentials are provided', async () => {
		const url = new URL('https://user:pass@example.com/api');
		const mockFetch = vi.fn().mockResolvedValue(new Response('ok')) as any;
		const result = wrapFetchWithCredentials(mockFetch, url);

		expect(result.fetch).not.toBe(mockFetch);
		expect(result.url.toString()).toBe('https://example.com/api');

		await result.fetch('https://example.com/api', { method: 'GET' });

		expect(mockFetch).toHaveBeenCalledWith(
			'https://example.com/api',
			expect.objectContaining({
				method: 'GET',
				headers: expect.any(Headers)
			})
		);
		const callInit = mockFetch.mock.calls[0][1];
		expect(callInit.headers.get('Authorization')).toBe('Basic ' + btoa('user:pass'));
	});

	it('should throw an error if credentials contain non-ASCII characters', () => {
		const url = new URL('https://example.com/api');
		Object.defineProperty(url, 'username', { value: 'usér' });
		Object.defineProperty(url, 'password', { value: 'pass' });
		const mockFetch = vi.fn() as any;

		expect(() => wrapFetchWithCredentials(mockFetch, url)).toThrow(
			'Non-ASCII characters are not allowed in credentials'
		);
	});
});
