import { OpenFoodFacts, type CurrentUserPermissions } from '@openfoodfacts/openfoodfacts-nodejs';
import { API_HOST } from '$lib/const';
import { ssrSafeFetch } from './utils';

export type { CurrentUserPermissions };

export async function fetchCurrentUserPermissions(
	fetch: typeof globalThis.fetch
): Promise<{ data?: CurrentUserPermissions; error?: string }> {
	try {
		const targetUrl = `${API_HOST}/api/v3/current-user/permissions`;
		const response = await ssrSafeFetch(fetch, targetUrl);
		const res = response as unknown as Response;

		if (!res || !res.ok) {
			return { error: `Failed to fetch user permissions: HTTP ${res?.status ?? 'unknown'}` };
		}

		const data: CurrentUserPermissions = await res.json();
		return { data };
	} catch (error) {
		return { error: error instanceof Error ? error.message : String(error) };
	}
}