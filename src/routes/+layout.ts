import { loadTranslations } from '$lib/translations';
import { get } from 'svelte/store';
import { preferences } from '$lib/settings';
import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ url }) => {
	const { pathname } = url;

	const lang = get(preferences).lang;

	loadTranslations(lang, pathname);

	return {};
};
