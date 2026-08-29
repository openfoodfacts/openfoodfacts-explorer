import { init, register, getLocaleFromNavigator, isLoading } from 'svelte-i18n';
import { get } from 'svelte/store';
import { preferences } from '$lib/settings';
import { browser } from '$app/environment';

export const locales = ['en', 'it'];

const FALLBACK_LOCALE = 'en';

const messageLoaders = import.meta.glob('./messages/*.json');

export const availableLocales = Object.keys(messageLoaders)
	.map((path) =>
		path
			.split('/')
			.pop()
			?.replace(/\.json$/, '')
			.replaceAll('_', '-')
	)
	.filter((locale): locale is string => locale != null)
	.toSorted();

Object.entries(messageLoaders).forEach(([path, loader]) => {
	const fileName = path.split('/').pop();
	if (!fileName) return;

	const locale = fileName.replace(/\.json$/, '').replaceAll('_', '-');
	register(locale, loader);
});

init({
	fallbackLocale: FALLBACK_LOCALE,
	initialLocale: getLocale()
});

export function getLocale() {
	return browser ? getBrowserLocale() : FALLBACK_LOCALE;
}

export function resolveAvailableLocale(candidate: string | null | undefined): string {
	if (!candidate) return FALLBACK_LOCALE;

	const normalized = candidate.replaceAll('_', '-').toLowerCase();
	const exactMatch = availableLocales.find((locale) => locale.toLowerCase() === normalized);
	if (exactMatch) return exactMatch;

	const language = normalized.split('-')[0];
	return (
		availableLocales.find((locale) => locale.toLowerCase() === language) ??
		availableLocales.find((locale) => locale.toLowerCase().startsWith(`${language}-`)) ??
		FALLBACK_LOCALE
	);
}

export function getBrowserLocale() {
	if (!browser) throw new Error('getBrowserLocale should only be called in the browser');
	const storedPreferences = get(preferences) as { locale?: string; lang?: string };
	const preferredLocale = storedPreferences.locale;
	const navLang = getLocaleFromNavigator();
	return resolveAvailableLocale(preferredLocale || storedPreferences.lang || navLang);
}

export { isLoading };
export * from 'svelte-i18n';
