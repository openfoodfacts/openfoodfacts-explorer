import { locale, waitLocale } from '$lib/i18n';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';
export const load: LayoutLoad = async () => {
	if (browser) {
		const stored = JSON.parse(localStorage.getItem('preferences') || '{}')?.lang;

		const normalized = stored === 'it' ? 'it-IT' : stored === 'en' ? 'en-US' : stored;

		const finalLocale = normalized || window.navigator.language || 'en-US';

		locale.set(finalLocale);
		console.log('i18n: Set locale to', finalLocale);
	}

	await waitLocale();

	return {};
};
