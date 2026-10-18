import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { PricesApi } from '@openfoodfacts/openfoodfacts-nodejs';

const mockEnv = {
	PUBLIC_PRICES_API_URL: ''
};

vi.mock('@openfoodfacts/openfoodfacts-nodejs', async (importOriginal) => {
	const actual = await importOriginal<Record<string, unknown>>();
	return {
		...actual,
		PricesApi: vi.fn()
	};
});

vi.mock('$app/env/public', async (importOriginal) => {
	const actual = await importOriginal<Record<string, unknown>>();
	return {
		...actual,
		get PUBLIC_PRICES_API_URL() {
			return mockEnv.PUBLIC_PRICES_API_URL;
		}
	};
});

const asFetch = (mock: unknown) => mock as typeof fetch;

describe('prices API service', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		mockEnv.PUBLIC_PRICES_API_URL = '';
	});

	describe('isConfigured and initialization safeguards', () => {
		it('returns false when PUBLIC_PRICES_API_URL is empty', async () => {
			mockEnv.PUBLIC_PRICES_API_URL = '';
			const { isConfigured } = await import('./prices');

			expect(isConfigured()).toBe(false);
		});

		it('returns true when PUBLIC_PRICES_API_URL is set', async () => {
			mockEnv.PUBLIC_PRICES_API_URL = 'https://prices.openfoodfacts.org';
			const { isConfigured } = await import('./prices');

			expect(isConfigured()).toBe(true);
		});

		it('throws an error if createPricesApi is called when unconfigured', async () => {
			mockEnv.PUBLIC_PRICES_API_URL = '';
			const { createPricesApi } = await import('./prices');
			const mockFetch = vi.fn();

			expect(() => createPricesApi(asFetch(mockFetch))).toThrow('Prices API is not configured');
		});
	});

	describe('createPricesApi client behavior', () => {
		it('instantiates PricesApi with baseUrl and undefined authToken when not logged in', async () => {
			mockEnv.PUBLIC_PRICES_API_URL = 'https://prices.openfoodfacts.org';
			const { createPricesApi } = await import('./prices');
			const mockFetch = vi.fn();

			createPricesApi(asFetch(mockFetch));

			expect(PricesApi).toHaveBeenCalledWith(asFetch(mockFetch), {
				baseUrl: 'https://prices.openfoodfacts.org',
				authToken: undefined
			});
		});

		it('injects authToken from preferences into PricesApi client', async () => {
			mockEnv.PUBLIC_PRICES_API_URL = 'https://prices.openfoodfacts.org';
			const { preferences } = await import('#lib/settings.js');
			preferences.update((p) => ({
				...p,
				prices: { ...p.prices, authToken: 'test-user-auth-token' }
			}));

			const { createPricesApi } = await import('./prices');
			const mockFetch = vi.fn();

			createPricesApi(asFetch(mockFetch));

			expect(PricesApi).toHaveBeenCalledWith(asFetch(mockFetch), {
				baseUrl: 'https://prices.openfoodfacts.org',
				authToken: 'test-user-auth-token'
			});
		});
	});

	describe('updatePricesAuthToken store reactivity & immutability', () => {
		it('updates authToken in preferences store while preserving other preferences, then clears back to null', async () => {
			const { preferences } = await import('#lib/settings.js');
			const { updatePricesAuthToken } = await import('./prices');

			preferences.update((p) => ({
				...p,
				prices: { ...p.prices, authToken: null }
			}));

			const initialPrefs = get(preferences);
			expect(initialPrefs.prices?.authToken).toBeNull();

			updatePricesAuthToken('sample_bearer_token');

			const updatedPrefs = get(preferences);
			expect(updatedPrefs.prices?.authToken).toBe('sample_bearer_token');
			// Verifies other settings are preserved (regression check for store mutation)
			expect(updatedPrefs.currency).toBe(initialPrefs.currency);
			expect(updatedPrefs.country).toBe(initialPrefs.country);

			updatePricesAuthToken(null);
			expect(get(preferences).prices?.authToken).toBeNull();
		});
	});
});
