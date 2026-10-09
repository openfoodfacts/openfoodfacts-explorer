import { describe, it, expect, vi, beforeEach } from 'vitest';

// mutable mock object (values can change inside tests)
const mockEnv = {
	PUBLIC_SEARCH_BASE_URL: ''
};

// mock SvelteKit's generated public env
vi.mock('$app/env/public', () => ({
	get PUBLIC_SEARCH_BASE_URL() {
		return mockEnv.PUBLIC_SEARCH_BASE_URL;
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
