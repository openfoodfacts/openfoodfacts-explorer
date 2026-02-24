import { describe, it, expect, vi, beforeEach } from 'vitest';

// create a mutable mock object
let mockEnv = { PUBLIC_SEARCH_BASE_URL: '' };

vi.mock('$env/dynamic/public', () => ({
	get env() {
		return mockEnv;
	}
}));

describe('getSearchBaseUrl', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should throw error if PUBLIC_SEARCH_BASE_URL is empty', async () => {
		mockEnv.PUBLIC_SEARCH_BASE_URL = '';

		const { getSearchBaseUrl } = await import('./search');

		expect(() => getSearchBaseUrl()).toThrow(/PUBLIC_SEARCH_BASE_URL is not set/);
	});

	it('should return base URL if PUBLIC_SEARCH_BASE_URL is set', async () => {
		mockEnv.PUBLIC_SEARCH_BASE_URL = 'https://example.com';

		const { getSearchBaseUrl } = await import('./search');

		expect(getSearchBaseUrl()).toBe('https://example.com');
	});
});
