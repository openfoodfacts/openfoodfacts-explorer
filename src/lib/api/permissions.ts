// TODO: switch to SDK
export type CurrentUserPermissions = {
	status: 'success' | 'failure';
	result?: { id: string };
	user?: {
		userid: string;
		name: string;
		moderator: 0 | 1;
		admin: 0 | 1;
	};
	errors?: Array<{
		message?: { id: string };
		impact?: { id: string };
	}>;
};

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
