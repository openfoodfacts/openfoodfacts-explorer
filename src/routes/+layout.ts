import { getLocaleForUrl, locale, waitLocale } from '#lib/i18n/index.js';
import { browser } from '$app/env';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
	if (browser) {
		const initialLocale = getLocaleForUrl(url);
		locale.set(initialLocale);
		console.debug('i18n: Set locale to', initialLocale);
	}
	await waitLocale();

	return {};
};
