import { get } from 'svelte/store';
import { preferences } from '$lib/settings';
import { PricesApi, type PaginatedPriceFullList } from '@openfoodfacts/openfoodfacts-nodejs';

const BASE_URL = import.meta.env.VITE_PRICES_API_URL;

export type PriceFull = PaginatedPriceFullList['items'][number][number];

export function isConfigured() {
	return BASE_URL != null;
}

export const createPricesApi = (fetch: typeof window.fetch): PricesApi => {
	const pricesApi = new PricesApi(fetch, {
		baseUrl: BASE_URL,
		authToken: `${get(preferences)?.prices?.authToken}`
	});
	return pricesApi;
};

export const updatePricesAuthToken = (token: string | null) => {
	preferences.update((p) => ({
		...p,
		prices: { ...p.prices, authToken: token }
	}));
};
