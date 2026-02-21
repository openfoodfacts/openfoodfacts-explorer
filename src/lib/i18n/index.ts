import { init, register, getLocaleFromNavigator, isLoading, locale } from 'svelte-i18n';
import { get } from 'svelte/store';
import { preferences } from '$lib/settings';
import { browser } from '$app/environment';

const locales = ['en-US', 'it-IT'];

const FALLBACK_LOCALE = 'en-US';

locales.forEach((locale) => {
	register(locale, async () => {
		const messages = await import(`./messages/${locale}.json`);
		return messages.default;
	});
});

const storedLang = browser ? JSON.parse(localStorage.getItem('preferences') || '{}')?.lang : null;

const normalizedLang = locales.includes(storedLang)
	? storedLang
	: storedLang === 'it'
		? 'it-IT'
		: storedLang === 'en'
			? 'en-US'
			: FALLBACK_LOCALE;

init({
	fallbackLocale: FALLBACK_LOCALE,
	initialLocale: normalizedLang || FALLBACK_LOCALE
});

export function getLocale() {
	return browser ? getBrowserLocale() : FALLBACK_LOCALE;
}

export function getBrowserLocale() {
	if (!browser) throw new Error('getBrowserLocale should only be called in the browser');
	const preferredLang = get(preferences).lang;
	const navLang = getLocaleFromNavigator();
	return preferredLang || navLang || FALLBACK_LOCALE;
}

export { isLoading };
export * from 'svelte-i18n';
