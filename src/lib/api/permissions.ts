import { OpenFoodFacts, type CurrentUserPermissions } from '@openfoodfacts/openfoodfacts-nodejs';
import { API_HOST } from '$lib/const';
export type { CurrentUserPermissions };

export async function fetchCurrentUserPermissions(
	fetch: typeof globalThis.fetch
): Promise<{ data?: CurrentUserPermissions; error?: string }> {
	try {
		const { data, error } = await new OpenFoodFacts(fetch, {
			host: API_HOST
		}).getCurrentUserPermissions();
		if (error != null) {
			return { error: `Failed to fetch user permissions: ${error}` };
		}
		return { data };
	} catch (error) {
		return { error: error instanceof Error ? error.message : String(error) };
	}
}
