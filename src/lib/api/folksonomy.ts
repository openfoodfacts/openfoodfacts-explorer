import { preferences } from '$lib/settings';
import { get } from 'svelte/store';

import { Folksonomy } from '@openfoodfacts/openfoodfacts-nodejs';

// TODO: remove this import when the nodejs type is updated
export type FolksonomyTag = {
	/** Product */
	product: string;
	/** K */
	k: string;
	/** V */
	v: string;
	/**
	 * Owner
	 * @default
	 */
	owner: string;
	/**
	 * Version
	 * @default 1
	 */
	version: number;
	/** Editor */
	editor?: string | null;
	/** Last Edit */
	last_edit?: string | null;
	/**
	 * Comment
	 * @default
	 */
	comment: string | null;
};
export type FolksonomyKey = {
	k: string;
	count: number;
	values: number;
};

const BASE_URL = import.meta.env.VITE_FOLKSONOMY_API_URL;

export function isConfigured() {
	return BASE_URL != null;
}

export function createFolksonomyApi(fetch: typeof window.fetch): Folksonomy {
	const folksonomyApi = new Folksonomy(fetch, {
		baseUrl: BASE_URL,
		authToken: `${get(preferences).folksonomy.authToken}`
	});
	return folksonomyApi;
}

// TODO: move to SDK
export async function getFolksonomyValues(fetch: typeof window.fetch, key: string) {
	const folksonomyApi = createFolksonomyApi(fetch);
	const response = await folksonomyApi.client.GET('/values/{k}', { params: { path: { k: key } } });
	if ('error' in response) {
		console.error(response.error);
		return [];
	}
	return response.data;
}

export function updateFolksonomyAuthToken(token: string | null) {
	preferences.update((p) => ({
		...p,
		folksonomy: { ...p.folksonomy, authToken: token }
	}));
}
