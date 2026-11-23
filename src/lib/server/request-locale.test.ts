import { get } from 'svelte/store';
import { describe, expect, it } from 'vitest';
import { _, getNumberFormatter, locale } from '#lib/i18n/index.js';
import { withRequestLocale } from './request-locale.js';

describe('request locale', () => {
	it('isolates translations and formatters across overlapping renders', async () => {
		const italianStarted = Promise.withResolvers<void>();
		const englishStarted = Promise.withResolvers<void>();
		const read = () => ({
			locale: get(locale),
			label: get(_)('settings_link', { default: 'Settings' }),
			number: getNumberFormatter().format(1.5)
		});

		const italian = withRequestLocale('it', async () => {
			italianStarted.resolve();
			await englishStarted.promise;
			return read();
		});
		await italianStarted.promise;
		const english = withRequestLocale('en', async () => {
			englishStarted.resolve();
			await italian;
			return read();
		});

		await expect(italian).resolves.toEqual({ locale: 'it', label: 'Impostazioni', number: '1,5' });
		await expect(english).resolves.toEqual({ locale: 'en', label: 'Settings', number: '1.5' });
	});
});
