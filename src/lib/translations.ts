import i18n, { type Config } from 'sveltekit-i18n';

function translationObj(locale: string, key: string) {
	return {
		locale,
		key,
		loader: async () => await import(`./translations/${locale}/${key}.json`)
	};
}

const config: Config = {
	loaders: [
		translationObj('en', 'common'),
		translationObj('en', 'home'),
		translationObj('it', 'common'),
		translationObj('it', 'home')
	],
	fallbackLocale: 'en'
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
