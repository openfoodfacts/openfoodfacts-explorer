import { describe, it, expect, vi } from 'vitest';
import { wrapFetchWithCredentials, ssrSafeFetch } from './utils';

describe('wrapFetchWithCredentials', () => {
	it('removes credentials from URL', () => {
		const url = new URL('https://user:pass@example.com/api');
		const mockFetch = vi.fn();

		const { url: cleanedUrl } = wrapFetchWithCredentials(mockFetch as typeof fetch, url);

		expect(cleanedUrl.toString()).toBe('https://example.com/api');
	});

	it('does not modify fetch when no credentials are present', () => {
		const url = new URL('https://example.com/api');
		const mockFetch = vi.fn();

		const result = wrapFetchWithCredentials(mockFetch as typeof fetch, url);

		expect(result.fetch).toBe(mockFetch);
	});
});

describe('ssrSafeFetch', () => {
	it('applies wrapFetchWithCredentials to globalThis.fetch when credentials are in URL on server', async () => {
		const mockFetch = vi.fn();
		const svelteKitFetch = vi.fn();
		const originalGlobalFetch = globalThis.fetch;
		globalThis.fetch = mockFetch;

		try {
			const fetchToUse = ssrSafeFetch(svelteKitFetch as typeof fetch, 'https://user:pass@example.com/api');
			await fetchToUse('https://example.com/api');

			expect(mockFetch).toHaveBeenCalled();
			const [, init] = mockFetch.mock.calls[0];
			const headers = new Headers(init?.headers);
			expect(headers.get('Authorization')).toBe('Basic ' + btoa('user:pass'));
		} finally {
			globalThis.fetch = originalGlobalFetch;
		}
	});

	it('returns globalThis.fetch directly when no credentials are present on server', () => {
		const svelteKitFetch = vi.fn();
		const result = ssrSafeFetch(svelteKitFetch as typeof fetch, 'https://example.com/api');
		expect(result).toBe(globalThis.fetch);
	});
});

