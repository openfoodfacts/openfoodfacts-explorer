import { get } from 'svelte/store';
import { preferences } from '$lib/settings';
import type { Load } from '@sveltejs/kit';
import { locale } from '$lib/i18n';

export const load: Load = async () => {
	const lang = get(preferences).lang;

	locale.set(lang);

	return {};
};
