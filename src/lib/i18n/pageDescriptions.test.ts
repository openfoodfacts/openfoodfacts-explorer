import { beforeEach, describe, expect, it } from 'vitest';
import { _, addMessages, init, locale } from 'svelte-i18n';
import { get } from 'svelte/store';
import { getPageDescription } from './pageDescriptions';
import en from './messages/en.json';
import enUS from './messages/en-US.json';
import fr from './messages/fr.json';

const keys = [
	'landing.subtitle',
	'landing.help_improve_desc',
	'explore.subtitle',
	'compare.page_description'
] as const;

describe('page descriptions', () => {
	beforeEach(async () => {
		addMessages('en', en);
		addMessages('en-US', enUS);
		addMessages('fr', fr);
		await init({ fallbackLocale: 'en', initialLocale: 'en' });
	});

	it.each(keys)('preserves the existing food translation for %s', async (key) => {
		for (const language of ['en', 'en-US', 'fr']) {
			await locale.set(language);
			expect(getPageDescription(get(_), key, 'food')).toBe(get(_)(key));
		}
	});

	it.each(['en', 'fr'])('uses source defaults for missing variants in %s', async (language) => {
		await locale.set(language);
		for (const flavor of ['beauty', 'petfood', 'product'] as const) {
			const expected = [
				enUS.landing.subtitle_by_flavor[flavor],
				enUS.landing.help_improve_desc_by_flavor[flavor],
				enUS.explore.subtitle_by_flavor[flavor],
				enUS.compare.page_description_by_flavor[flavor]
			];
			expect(keys.map((key) => getPageDescription(get(_), key, flavor))).toEqual(expected);
		}
	});

	it('uses a translated variant when available', async () => {
		addMessages('test', {
			landing: { subtitle_by_flavor: { beauty: 'Description traduite des cosmétiques' } }
		});
		await locale.set('test');
		expect(getPageDescription(get(_), 'landing.subtitle', 'beauty')).toBe(
			'Description traduite des cosmétiques'
		);
	});

	it('does not describe cosmetics or general products as nutritional information', () => {
		for (const flavor of ['beauty', 'product'] as const) {
			for (const key of keys) {
				expect(getPageDescription(get(_), key, flavor)).not.toMatch(/food|nutrition/i);
			}
		}
	});
});
