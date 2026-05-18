import { describe, it, expect, vi, beforeEach } from 'vitest';

// mutable mock object (values can change inside tests)
const mockEnv = {
	PUBLIC_SEARCH_BASE_URL: ''
};

// mock Svelte public env
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

		expect(() => getSearchBaseUrl()).toThrow(
			'PUBLIC_SEARCH_BASE_URL is not set. Please set it in your environment variables.'
		);
	});

	it('should return base URL if PUBLIC_SEARCH_BASE_URL is set', async () => {
		mockEnv.PUBLIC_SEARCH_BASE_URL = 'https://example.com';

		const { getSearchBaseUrl } = await import('./search');

		expect(getSearchBaseUrl()).toBe('https://example.com');
	});
});
