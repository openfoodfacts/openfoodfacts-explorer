import type { CurrentUserPermissions } from '$lib/types/sdk-overrides';
export type { CurrentUserPermissions };

export async function fetchCurrentUserPermissions(
	fetch: typeof globalThis.fetch,
	url: string
): Promise<CurrentUserPermissions | null> {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			console.error(`Failed to fetch user permissions: HTTP ${response.status}`);
			return null;
		}

		return (await response.json()) as CurrentUserPermissions;
	} catch (error) {
		console.error('Network error fetching user permissions:', error);
		return null;
	}
}
