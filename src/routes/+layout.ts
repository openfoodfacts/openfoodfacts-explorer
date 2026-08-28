import { getLocale, locale, waitLocale } from '$lib/i18n';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	if (browser) {
		const initialLocale = getLocale();
		locale.set(initialLocale);
		console.debug('i18n: Set locale to', initialLocale);
	}
	await waitLocale();

	return {};
};
