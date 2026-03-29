import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isConfigured, createFolksonomyApi, getFolksonomyValues } from './folksonomy';
import { Folksonomy } from '@openfoodfacts/openfoodfacts-nodejs';
import { wrapFetchWithAuth } from '$lib/stores/auth';

const { mockGetValues, mockedEnv } = vi.hoisted(() => ({
	mockGetValues: vi.fn(),
	mockedEnv: {
		PUBLIC_FOLKSONOMY_API_URL: 'https://api.folksonomy.openfoodfacts.org' as string | undefined
	}
}));

vi.mock('$env/dynamic/public', () => ({
	env: mockedEnv
}));

vi.mock('$lib/stores/auth', () => ({
	wrapFetchWithAuth: vi.fn((fetch) => fetch)
}));

vi.mock('@openfoodfacts/openfoodfacts-nodejs', () => {
	return {
		Folksonomy: vi.fn().mockImplementation(function (fetch, options) {
			return { fetch, options, getValues: mockGetValues };
		})
	};
});

describe('folksonomy.ts utilities', () => {
	let mockFetch: typeof window.fetch;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetValues.mockReset();
		mockFetch = vi.fn();
		mockedEnv.PUBLIC_FOLKSONOMY_API_URL = 'https://api.folksonomy.openfoodfacts.org';
	});

	describe('isConfigured', () => {
		it('should return true if PUBLIC_FOLKSONOMY_API_URL is defined', () => {
			expect(isConfigured()).toBe(true);
		});

		it('should return false if PUBLIC_FOLKSONOMY_API_URL is not defined', async () => {
			mockedEnv.PUBLIC_FOLKSONOMY_API_URL = undefined;
			vi.resetModules();

			const { isConfigured } = await import('./folksonomy');

			expect(isConfigured()).toBe(false);

			// Restore for other tests
			mockedEnv.PUBLIC_FOLKSONOMY_API_URL = 'https://api.folksonomy.openfoodfacts.org';
		});
	});

	describe('createFolksonomyApi', () => {
		it('should create Folksonomy instance with wrapped fetch and base URL', () => {
			const api = createFolksonomyApi(mockFetch);

			expect(wrapFetchWithAuth).toHaveBeenCalledWith(mockFetch);

			const wrappedFetch = vi.mocked(wrapFetchWithAuth).mock.results[0].value;
			expect(Folksonomy).toHaveBeenCalledWith(wrappedFetch, {
				baseUrl: 'https://api.folksonomy.openfoodfacts.org'
			});
			expect(Folksonomy).toHaveBeenCalledTimes(1);
			expect(api).toEqual({
				fetch: wrappedFetch,
				options: {
					baseUrl: 'https://api.folksonomy.openfoodfacts.org'
				},
				getValues: mockGetValues
			});
		});
	});

	describe('getFolksonomyValues', () => {
		it('should return empty array and log error when response has an error', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			mockGetValues.mockResolvedValueOnce({ error: 'Some error' });

			const result = await getFolksonomyValues(mockFetch, 'test-key');

			expect(mockGetValues).toHaveBeenCalledWith('test-key');
			expect(result).toEqual([]);
			expect(consoleSpy).toHaveBeenCalledWith(expect.anything());

			consoleSpy.mockRestore();
		});

		it('should return data when response is successful', async () => {
			const mockData = [{ id: '1', name: 'value1' }];

			mockGetValues.mockResolvedValueOnce({ data: mockData });

			const result = await getFolksonomyValues(mockFetch, 'test-key');

			expect(mockGetValues).toHaveBeenCalledWith('test-key');
			expect(result).toEqual(mockData);
		});
	});
});
