import { Folksonomy } from '@openfoodfacts/openfoodfacts-nodejs';
import { wrapFetchWithAuth } from '$lib/stores/auth';
import { env } from '$env/dynamic/public';

const BASE_URL = env.PUBLIC_FOLKSONOMY_API_URL;

export function isConfigured() {
	return BASE_URL != null;
}

export function createFolksonomyApi(fetch: typeof window.fetch): Folksonomy {
	const wrappedFetch = wrapFetchWithAuth(fetch);
	return new Folksonomy(wrappedFetch, { baseUrl: BASE_URL });
}

export async function getFolksonomyValues(fetch: typeof window.fetch, key: string) {
	const folksonomyApi = createFolksonomyApi(fetch);
	const response = await folksonomyApi.getValues(key);
	if ('error' in response) {
		console.error(response.error);
		return [];
	}
	return response.data;
}
