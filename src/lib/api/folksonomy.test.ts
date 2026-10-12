import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Folksonomy } from '@openfoodfacts/openfoodfacts-nodejs';

const mockEnv = {
	PUBLIC_FOLKSONOMY_API_URL: ''
};

vi.mock('$app/env/public', async (importOriginal) => {
	const actual = await importOriginal<Record<string, unknown>>();
	return {
		...actual,
		get PUBLIC_FOLKSONOMY_API_URL() {
			return mockEnv.PUBLIC_FOLKSONOMY_API_URL;
		}
	};
});

describe('folksonomy API service', () => {
	beforeEach(() => {
		vi.resetModules();
		mockEnv.PUBLIC_FOLKSONOMY_API_URL = '';
	});

	describe('isConfigured safeguard', () => {
		it('returns false when PUBLIC_FOLKSONOMY_API_URL is empty', async () => {
			mockEnv.PUBLIC_FOLKSONOMY_API_URL = '';
			const { isConfigured } = await import('./folksonomy');

			expect(isConfigured()).toBe(false);
		});

		it('returns true when PUBLIC_FOLKSONOMY_API_URL is configured', async () => {
			mockEnv.PUBLIC_FOLKSONOMY_API_URL = 'https://api.folksonomy.openfoodfacts.org';
			const { isConfigured } = await import('./folksonomy');

			expect(isConfigured()).toBe(true);
		});
	});

	describe('createFolksonomyApi instantiation', () => {
		it('creates a Folksonomy client instance with configured baseUrl', async () => {
			mockEnv.PUBLIC_FOLKSONOMY_API_URL = 'https://api.folksonomy.openfoodfacts.org';
			const { createFolksonomyApi } = await import('./folksonomy');
			const mockFetch = vi.fn();

			const api = createFolksonomyApi(mockFetch as unknown as typeof fetch);

			expect(api).toBeInstanceOf(Folksonomy);
		});
	});

	describe('getFolksonomyValues behavior & resilience', () => {
		it('unwraps and returns values data on successful response', async () => {
			mockEnv.PUBLIC_FOLKSONOMY_API_URL = 'https://api.folksonomy.openfoodfacts.org';
			const expectedValues = [{ k: 'packaging', v: 'glass', count: 12 }];

			const mockFetch = vi.fn().mockResolvedValue(
				new Response(JSON.stringify(expectedValues), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);

			const { getFolksonomyValues } = await import('./folksonomy');
			const values = await getFolksonomyValues(mockFetch as unknown as typeof fetch, 'packaging');

			expect(values).toEqual(expectedValues);
		});

		it('gracefully returns an empty array when the API returns an error response', async () => {
			mockEnv.PUBLIC_FOLKSONOMY_API_URL = 'https://api.folksonomy.openfoodfacts.org';
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			// 404 response simulating missing key or error from folksonomy API
			const mockFetch = vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ detail: 'Key not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' }
				})
			);

			const { getFolksonomyValues } = await import('./folksonomy');
			const values = await getFolksonomyValues(
				mockFetch as unknown as typeof fetch,
				'non_existent_key'
			);

			expect(values).toEqual([]);
			consoleSpy.mockRestore();
		});
	});
});
