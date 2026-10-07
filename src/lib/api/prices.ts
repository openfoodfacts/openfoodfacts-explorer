import { get } from 'svelte/store';
import { preferences } from '#lib/settings.js';
import { PricesApi } from '@openfoodfacts/openfoodfacts-nodejs';
import { PUBLIC_PRICES_API_URL } from '$app/env/public';

const BASE_URL = PUBLIC_PRICES_API_URL || undefined;

export function isConfigured() {
	return BASE_URL != null;
}

export const createPricesApi = (fetch: typeof window.fetch): PricesApi => {
	if (!isConfigured()) {
		throw new Error('Prices API is not configured');
	}
	// We know this is not null because of the check above
	const baseUrl = BASE_URL!;

	const authToken = get(preferences)?.prices?.authToken ?? undefined;
	const pricesApi = new PricesApi(fetch, { baseUrl, authToken });
	return pricesApi;
};

export const updatePricesAuthToken = (token: string | null) => {
	preferences.update((p) => ({
		...p,
		prices: { ...p.prices, authToken: token }
	}));
};
