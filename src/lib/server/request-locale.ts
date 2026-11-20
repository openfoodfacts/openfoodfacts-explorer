import { AsyncLocalStorage } from 'node:async_hooks';
import { setServerLocaleReader, waitLocale } from '#lib/i18n/index.js';

const requestLocale = new AsyncLocalStorage<string>();
setServerLocaleReader(() => requestLocale.getStore());

/** Loads the chosen language's catalogs and makes its locale available throughout the async render. */
export async function withRequestLocale<T>(language: string, render: () => T): Promise<T> {
	// Load shared fallback catalogs first so overlapping locales can reuse their pending loads.
	await waitLocale('en');
	const parts = language.split('-');
	for (let i = 1; i <= parts.length; i++) {
		await waitLocale(parts.slice(0, i).join('-'));
	}
	return requestLocale.run(language, render);
}
