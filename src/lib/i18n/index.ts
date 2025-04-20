import { browser } from '$app/environment';
import { init, register, getLocaleFromNavigator, waitLocale } from 'svelte-i18n';
import { get } from 'svelte/store';
import { preferences } from '$lib/settings';

const locales = ['en', 'it'];

locales.forEach((locale) => {
	register(locale, async () => {
		const messages = await import(`./messages/${locale}.json`);
		return messages.default;
	});
});

init({
	fallbackLocale: 'en',
	initialLocale: 'en'
});

export async function initI18n() {
	const userPreferredLanguage = browser ? get(preferences).lang : 'en';

	const localeToUse = browser ? userPreferredLanguage || getLocaleFromNavigator() || 'en' : 'en';

	init({
		fallbackLocale: 'en',
		initialLocale: localeToUse
	});

	if (browser) {
		await waitLocale(localeToUse);
	}
}

export * from 'svelte-i18n';
