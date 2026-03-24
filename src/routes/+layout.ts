import { locale, waitLocale } from '$lib/i18n';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	if (browser) {
		locale.set(window.navigator.language);
		console.debug('i18n: Set locale to', window.navigator.language);
	}
	await waitLocale();

	return {};
};
