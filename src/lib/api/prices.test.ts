import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
	env: {
		PUBLIC_PRICES_API_URL: 'https://prices.openfoodfacts.net'
	}
}));

vi.mock('$lib/settings', () => {
	let state = { prices: { authToken: 'initial-token' } };
	return {
		preferences: {
			update: vi.fn((updater) => {
				state = updater(state);
			}),
			subscribe: vi.fn()
		}
	};
});

vi.mock('svelte/store', () => ({
	get: vi.fn(() => ({ prices: { authToken: 'test-token' } }))
}));

vi.mock('@openfoodfacts/openfoodfacts-nodejs', () => {
	return {
		PricesApi: vi.fn().mockImplementation(function (fetch, options) {
			return { fetch, options };
		})
	};
});

import { isConfigured, createPricesApi, updatePricesAuthToken } from './prices';
import { get } from 'svelte/store';
import { preferences } from '$lib/settings';
import { PricesApi } from '@openfoodfacts/openfoodfacts-nodejs';

describe('prices.ts utilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('isConfigured', () => {
		it('should return true if PUBLIC_PRICES_API_URL is defined', () => {
			expect(isConfigured()).toBe(true);
		});
	});

	describe('createPricesApi', () => {
		it('should create an instance of PricesApi with the correct config', () => {
			const mockFetch = vi.fn();
			const api = createPricesApi(mockFetch as unknown as typeof window.fetch);

			expect(get).toHaveBeenCalledWith(preferences);
			expect(PricesApi).toHaveBeenCalledWith(mockFetch, {
				baseUrl: 'https://prices.openfoodfacts.net',
				authToken: 'test-token'
			});
			expect(PricesApi).toHaveBeenCalledTimes(1);
			expect(api).toEqual({
				fetch: mockFetch,
				options: {
					baseUrl: 'https://prices.openfoodfacts.net',
					authToken: 'test-token'
				}
			});
		});

		it('should use undefined if authToken is missing', () => {
			// override the mock temporarily
			vi.mocked(get).mockReturnValueOnce({});
			const mockFetch = vi.fn();
			createPricesApi(mockFetch as unknown as typeof window.fetch);

			expect(PricesApi).toHaveBeenCalledWith(mockFetch, {
				baseUrl: 'https://prices.openfoodfacts.net',
				authToken: undefined
			});
		});

		it('should use undefined if prices store is missing', () => {
			// override the mock temporarily
			vi.mocked(get).mockReturnValueOnce(undefined);
			const mockFetch = vi.fn();
			createPricesApi(mockFetch as unknown as typeof window.fetch);

			expect(PricesApi).toHaveBeenCalledWith(mockFetch, {
				baseUrl: 'https://prices.openfoodfacts.net',
				authToken: undefined
			});
		});
	});

	describe('updatePricesAuthToken', () => {
		it('should update the preferences store with the new token', () => {
			updatePricesAuthToken('new-token-123');
			expect(preferences.update).toHaveBeenCalled();

			// Extract the updater function from the mock
			const updaterFn = vi.mocked(preferences.update).mock.calls[0][0];
			const newState = updaterFn({ prices: { authToken: 'old' }, other: 'value' });

			expect(newState).toEqual({
				other: 'value',
				prices: {
					authToken: 'new-token-123'
				}
			});
		});

		it('should handle updating to a null token', () => {
			updatePricesAuthToken(null);

			const updaterFn = vi.mocked(preferences.update).mock.calls[0][0];
			const newState = updaterFn({ prices: { authToken: 'old' } });

			expect(newState.prices.authToken).toBeNull();
		});

		it('should handle missing prices object in store', () => {
			updatePricesAuthToken('token-xyz');

			const updaterFn = vi.mocked(preferences.update).mock.calls[0][0];

			const newState = updaterFn({} as any); // no prices

			expect(newState).toEqual({
				prices: {
					authToken: 'token-xyz'
				}
			});
		});
	});
});
