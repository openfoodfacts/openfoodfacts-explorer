import { browser } from '$app/environment';
import { init, register, getLocaleFromNavigator } from 'svelte-i18n';

const locales = ['en', 'it'];

locales.forEach((locale) => {
	register(locale, async () => {
		const messages = await import(`./messages/${locale}.json`);
		return messages.default;
	});
});

export function initI18n() {
	init({
		fallbackLocale: 'en',
		initialLocale: browser ? getLocaleFromNavigator() : 'en'
	});
}

export * from 'svelte-i18n';
