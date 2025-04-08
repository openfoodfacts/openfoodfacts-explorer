import { get } from 'svelte/store';
import { preferences } from '$lib/settings';
import type { Load } from '@sveltejs/kit';
import { locale } from '$lib/i18n';

export const load: Load = async () => {
	const lang = get(preferences).lang;

	// Set the current locale based on user preferences
	locale.set(lang);

	return {};
};
