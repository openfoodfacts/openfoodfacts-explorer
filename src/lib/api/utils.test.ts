import { describe, it, expect, vi } from 'vitest';
import { wrapFetchWithCredentials } from './utils';

describe('wrapFetchWithCredentials', () => {
	it('removes credentials from URL', () => {
		const url = new URL('https://user:pass@example.com/api');
		const mockFetch = vi.fn();

		const { url: cleanedUrl } = wrapFetchWithCredentials(mockFetch as any, url);

		expect(cleanedUrl.toString()).toBe('https://example.com/api');
	});

	it('does not modify fetch when no credentials are present', () => {
		const url = new URL('https://example.com/api');
		const mockFetch = vi.fn();

		const result = wrapFetchWithCredentials(mockFetch as any, url);

		expect(result.fetch).toBe(mockFetch);
	});
});
