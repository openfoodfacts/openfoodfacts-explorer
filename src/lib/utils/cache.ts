import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { API_HOST, OPEN_PRICES_BASE_URL, PRODUCT_URL, SEARCH_URL, TAXONOMY_URL } from '$lib/const';

const APP_STORAGE_KEYS = ['compareProducts', 'nutritionCalculatorItems', 'personalizedSearch'];
const FACET_KNOWLEDGE_PANEL_URL = 'https://facets-kp.openfoodfacts.org/knowledge_panel';

const CACHE_TARGET_URLS = [
	'/settings',
	'/search',
	`${API_HOST}/api/v3.4/attribute_groups`,
	SEARCH_URL,
	`${API_HOST}/api/v3/product/`,
	PRODUCT_URL('{barcode}'),
	TAXONOMY_URL('languages'),
	TAXONOMY_URL('countries'),
	FACET_KNOWLEDGE_PANEL_URL,
	OPEN_PRICES_BASE_URL,
	env.PUBLIC_SEARCH_BASE_URL
].filter((url): url is string => typeof url === 'string' && url.trim() !== '');

export type ClearAppCacheResult = {
	clearedCount: number;
	storageKeys: string[];
	cacheNames: string[];
	requestUrls: string[];
};

function matchesCacheTarget(requestUrl: string) {
	return CACHE_TARGET_URLS.some((targetUrl) => {
		if (targetUrl.includes('{barcode}')) return false;
		if (targetUrl.startsWith('/')) return new URL(requestUrl).pathname === targetUrl;
		return requestUrl === targetUrl || requestUrl.startsWith(targetUrl);
	});
}

async function clearTargetedRequestsFromCache(cacheName: string): Promise<string[]> {
	const cache = await caches.open(cacheName);
	const requests = await cache.keys();
	const deletedUrls: string[] = [];

	await Promise.all(
		requests.map(async (request) => {
			if (!matchesCacheTarget(request.url)) return;

			const deleted = await cache.delete(request);
			if (deleted) deletedUrls.push(request.url);
		})
	);

	return deletedUrls;
}

/**
 * Safely clear application cache
 * This clears only temporary app-specific browser state.
 *
 * It intentionally leaves authentication and preference keys alone:
 * - userAuthTokens, verifier, authState, authRedirect are login/session state.
 * - preferences may contain language, country, editing preferences, and API tokens.
 */
export async function clearAppCache(): Promise<ClearAppCacheResult> {
	const result: ClearAppCacheResult = {
		clearedCount: 0,
		storageKeys: [],
		cacheNames: [],
		requestUrls: []
	};

	if (!browser) return result;

	try {
		for (const key of APP_STORAGE_KEYS) {
			if (localStorage.getItem(key) != null) {
				localStorage.removeItem(key);
				result.storageKeys.push(key);
				result.clearedCount += 1;
			}
		}

		if ('caches' in globalThis) {
			const cacheNames = await caches.keys();
			const appCacheNames = cacheNames.filter((name) => name.startsWith('cache-'));

			await Promise.all(
				appCacheNames.map(async (name) => {
					const requestUrls = await clearTargetedRequestsFromCache(name);
					result.requestUrls.push(...requestUrls);
					result.clearedCount += requestUrls.length;

					const deleted = await caches.delete(name);
					if (deleted) {
						result.cacheNames.push(name);
						result.clearedCount += 1;
					}
				})
			);
		}

		return result;
	} catch (error) {
		console.error('Failed to clear app cache:', error);
		throw error;
	}
}
