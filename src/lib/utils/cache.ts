import { browser } from '$app/environment';

const APP_CACHE_KEYS = [
	'preferences',
	'personalizedSearch',
	'compareProducts',
	'nutritionCalculatorItems',
	'userAuthTokens',
	'verifier',
	'authState',
	'authRedirect'
];

/**
 * Clear app-owned localStorage keys and service worker caches.
 */
export async function clearAppCache(): Promise<void> {
	if (!browser) return;

	try {
		for (const key of APP_CACHE_KEYS) {
			localStorage.removeItem(key);
		}

		if ('caches' in window) {
			const keys = await caches.keys();
			await Promise.all(keys.map((k) => caches.delete(k)));
		}
	} catch {
		// swallow errors
	}
}
