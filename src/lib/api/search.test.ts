import { describe, it, expect, vi, beforeEach } from 'vitest';

// mutable mock object (values can change inside tests)
const mockEnv = {
	PUBLIC_SEARCH_BASE_URL: ''
};
const mockEnvironment = {
	browser: false
};

// mock Svelte public env
vi.mock('$env/dynamic/public', () => ({
	get env() {
		return mockEnv;
	}
}));

vi.mock('$app/environment', () => mockEnvironment);

describe('getSearchBaseUrl', () => {
	beforeEach(() => {
		mockEnvironment.browser = false;
		vi.resetModules();
	});

	it('uses the relative proxy URL in the browser', async () => {
		mockEnvironment.browser = true;

		const { getSearchBaseUrl } = await import('./search');

		expect(getSearchBaseUrl()).toBe('/api/search');
	});

	it('should return fallback if PUBLIC_SEARCH_BASE_URL is empty', async () => {
		mockEnv.PUBLIC_SEARCH_BASE_URL = '';

		const { getSearchBaseUrl } = await import('./search');

		expect(getSearchBaseUrl()).toBe('https://search.openfoodfacts.org');
	});

	it('should return base URL if PUBLIC_SEARCH_BASE_URL is set', async () => {
		mockEnv.PUBLIC_SEARCH_BASE_URL = 'https://example.com';

		const { getSearchBaseUrl } = await import('./search');

		expect(getSearchBaseUrl()).toBe('https://example.com');
	});
});
