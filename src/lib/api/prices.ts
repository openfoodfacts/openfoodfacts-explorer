import { get } from 'svelte/store';
import { preferences } from '$lib/settings';
import { PricesApi } from '@openfoodfacts/openfoodfacts-nodejs';
import { env } from '$env/dynamic/public';

const BASE_URL = env.PUBLIC_PRICES_API_URL;

export function isConfigured() {
	return BASE_URL != null;
}

export const createPricesApi = (fetch: typeof window.fetch): PricesApi => {
	const authToken = get(preferences)?.prices?.authToken ?? undefined;
	const pricesApi = new PricesApi(fetch, {
		baseUrl: BASE_URL as string,
		authToken
	});
	return pricesApi;
};

export const updatePricesAuthToken = (token: string | null) => {
	preferences.update((p) => ({
		...p,
		prices: { ...p.prices, authToken: token }
	}));
};
