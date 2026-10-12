import { describe, it, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { PricesApi } from '@openfoodfacts/openfoodfacts-nodejs';

const mockEnv = {
	PUBLIC_PRICES_API_URL: ''
};

vi.mock('$app/env/public', async (importOriginal) => {
	const actual = await importOriginal<Record<string, unknown>>();
	return {
		...actual,
		get PUBLIC_PRICES_API_URL() {
			return mockEnv.PUBLIC_PRICES_API_URL;
		}
	};
});

describe('prices API service', () => {
	beforeEach(() => {
		vi.resetModules();
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

			expect(() => createPricesApi(mockFetch as unknown as typeof fetch)).toThrow(
				'Prices API is not configured'
			);
		});
	});

	describe('createPricesApi client behavior', () => {
		it('instantiates PricesApi with baseUrl and undefined authToken when not logged in', async () => {
			mockEnv.PUBLIC_PRICES_API_URL = 'https://prices.openfoodfacts.org';
			const { createPricesApi } = await import('./prices');
			const mockFetch = vi.fn();

			const api = createPricesApi(mockFetch as unknown as typeof fetch);

			expect(api).toBeInstanceOf(PricesApi);
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

			const api = createPricesApi(mockFetch as unknown as typeof fetch);

			expect(api).toBeInstanceOf(PricesApi);
		});
	});

	describe('updatePricesAuthToken store reactivity & immutability', () => {
		it('updates authToken in preferences store while preserving other preferences', async () => {
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
		});

		it('clears authToken back to null when requested', async () => {
			const { preferences } = await import('#lib/settings.js');
			const { updatePricesAuthToken } = await import('./prices');

			updatePricesAuthToken('temp-token');
			expect(get(preferences).prices?.authToken).toBe('temp-token');

			updatePricesAuthToken(null);
			expect(get(preferences).prices?.authToken).toBeNull();
		});
	});
});
