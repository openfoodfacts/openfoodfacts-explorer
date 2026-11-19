import { getLocaleForUrl, locale, waitLocale } from '#lib/i18n/index.js';
import { browser } from '$app/env';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
	if (browser) {
		const initialLocale = getLocaleForUrl(url);
		await locale.set(initialLocale);
		await waitLocale(initialLocale);
		console.debug('i18n: Set locale to', initialLocale);
	}
	return {};
};
