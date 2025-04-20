import { browser } from '$app/environment';
import { init, register, getLocaleFromNavigator } from 'svelte-i18n';
import { get } from 'svelte/store';
import { preferences } from '$lib/settings';

const locales = ['en', 'it'];

locales.forEach((locale) => {
	register(locale, async () => {
		const messages = await import(`./messages/${locale}.json`);
		return messages.default;
	});
});

export function initI18n() {
	const userPreferredLanguage = browser ? get(preferences).lang : 'en';

	init({
		fallbackLocale: 'en',
		initialLocale: userPreferredLanguage || (browser ? getLocaleFromNavigator() : 'en')
	});
}

export * from 'svelte-i18n';