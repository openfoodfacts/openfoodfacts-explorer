import { API_HOST } from '$lib/const';
import type { CurrentUserPermissions } from '$lib/types/sdk-overrides';
export type { CurrentUserPermissions };

export async function fetchCurrentUserPermissions(
	fetch: typeof globalThis.fetch
): Promise<{ data?: CurrentUserPermissions; error?: string }> {
	try {
		const targetUrl = `${API_HOST}/api/v3/current-user/permissions`;
		const response = await fetch(targetUrl);

		if (!response.ok) {
			return { error: `Failed to fetch user permissions: HTTP ${response.status}` };
		}

		const data = (await response.json()) as CurrentUserPermissions;
		return { data };
	} catch (error) {
		return { error: error instanceof Error ? error.message : String(error) };
	}
}
