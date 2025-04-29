import { preferences } from '$lib/settings';
import { get } from 'svelte/store';

import type { components } from './folksonomy.d';
import { Folksonomy } from '@openfoodfacts/openfoodfacts-nodejs';

export type FolksonomyTag = components['schemas']['ProductTag'];
export type FolksonomyKey = {
	k: string;
	count: number;
	values: number;
};

const BASE_URL = import.meta.env.VITE_FOLKSONOMY_API_URL;

export function isConfigured() {
	return BASE_URL != null;
}

export const createFolksonomyApi = (fetch: typeof window.fetch): Folksonomy => {
	const folksonomyApi = new Folksonomy(fetch, {
		baseUrl: BASE_URL,
		authToken: `${get(preferences).folksonomy.authToken}`
	});
	return folksonomyApi;
};

export const updateFolksonomyAuthToken = (token: string | null) => {
	preferences.update((p) => ({
		...p,
		folksonomy: { ...p.folksonomy, authToken: token }
	}));
};
