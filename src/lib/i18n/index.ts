import * as runtime from 'svelte-i18n';
import { get, type Readable } from 'svelte/store';
import { preferences } from '#lib/settings.js';
import { browser } from '$app/env';
import { parseUrlLocation } from '#lib/url-location.js';
import { availableLocales, messageLoaders } from './locales.js';

export { availableLocales } from './locales.js';

const FALLBACK_LOCALE = 'en';

let readServerLocale: () => string | undefined = () => undefined;
/** Connects the shared i18n module to the server's request context at startup. */
export function setServerLocaleReader(reader: typeof readServerLocale): void {
	readServerLocale = reader;
}

Object.entries(messageLoaders).forEach(([path, loader]) => {
	const fileName = path.split('/').pop();
	if (!fileName) return;

	const locale = fileName.replace(/\.json$/, '').replaceAll('_', '-');
	runtime.register(locale, loader);
});

runtime.init({
	fallbackLocale: FALLBACK_LOCALE,
	initialLocale: getLocale()
});

/** Returns the browser's selected locale or the current request's locale during SSR. */
export function getLocale() {
	return browser ? getBrowserLocale() : (readServerLocale() ?? FALLBACK_LOCALE);
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

export function getLocaleForUrl(url: Pick<URL, 'pathname'>, preferredLocale?: string): string {
	const language = parseUrlLocation(url.pathname)?.language;
	if (!language) return getLocale();
	const preferred = preferredLocale ?? (browser ? get(preferences).locale : undefined);
	if (preferred && preferred.replaceAll('_', '-').split('-')[0].toLowerCase() === language) {
		return resolveAvailableLocale(preferred);
	}
	return resolveAvailableLocale(language);
}

export function getBrowserLocale() {
	if (!browser) throw new Error('getBrowserLocale should only be called in the browser');
	const location = parseUrlLocation(window.location.pathname);
	if (location) return getLocaleForUrl(window.location);
	const storedPreferences = get(preferences) as { locale?: string; lang?: string };
	const preferredLocale = storedPreferences.locale;
	const navLang = runtime.getLocaleFromNavigator();
	return resolveAvailableLocale(preferredLocale || storedPreferences.lang || navLang);
}

type MessageFormatter = typeof runtime._ extends Readable<infer Formatter> ? Formatter : never;
const formatMessage = get(runtime._);

/** Uses the request locale when the caller hasn't specified a locale. */
function formatterOptions<T extends { locale?: string }>(options?: T) {
	return { ...options, locale: options?.locale ?? getLocale() };
}

const formatServerMessage: MessageFormatter = (message, options) => {
	const { id, ...messageOptions } =
		typeof message === 'string' ? { ...options, id: message } : message;
	return formatMessage(id, formatterOptions(messageOptions));
};

/** Reads once per SSR subscription so a shared store cannot retain another request's value. */
function serverStore<T>(read: () => T): Readable<T> {
	return {
		subscribe(run) {
			run(read());
			return () => {};
		}
	};
}

export const _: typeof runtime._ = browser ? runtime._ : serverStore(() => formatServerMessage);

export const locale: Pick<typeof runtime.locale, 'set' | 'subscribe'> = browser
	? runtime.locale
	: { ...serverStore(getLocale), set() {} };

export const getDateFormatter: typeof runtime.getDateFormatter = browser
	? runtime.getDateFormatter
	: (options) => runtime.getDateFormatter(formatterOptions(options));
export const getNumberFormatter: typeof runtime.getNumberFormatter = browser
	? runtime.getNumberFormatter
	: (options) => runtime.getNumberFormatter(formatterOptions(options));

export { isLoading, waitLocale } from 'svelte-i18n';
