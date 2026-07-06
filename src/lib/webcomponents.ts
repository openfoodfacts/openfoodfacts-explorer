const FALLBACK_WEBCOMPONENTS_LANGUAGE_CODE = 'en';

// Keep in sync with @openfoodfacts/openfoodfacts-webcomponents targetLocales.
const SUPPORTED_WEBCOMPONENTS_LANGUAGE_CODES: ReadonlySet<string> = new Set([
	'af',
	'am',
	'ar',
	'ay',
	'az',
	'be',
	'bg',
	'bi',
	'bn',
	'bs',
	'ca',
	'ch',
	'cs',
	'cy',
	'da',
	'de',
	'dv',
	'dz',
	'el',
	'en',
	'es',
	'et',
	'eu',
	'fa',
	'fi',
	'fj',
	'fr',
	'ga',
	'gd',
	'gl',
	'gn',
	'gv',
	'he',
	'hi',
	'ho',
	'hr',
	'ht',
	'hu',
	'hy',
	'id',
	'is',
	'it',
	'ja',
	'ka',
	'kk',
	'kl',
	'km',
	'ko',
	'ku',
	'ky',
	'la',
	'lb',
	'lo',
	'lt',
	'lv',
	'mg',
	'mh',
	'mi',
	'mk',
	'mn',
	'ms',
	'mt',
	'my',
	'na',
	'nb',
	'nd',
	'ne',
	'nl',
	'nr',
	'ny',
	'pap',
	'pl',
	'prs',
	'ps',
	'pt',
	'qu',
	'rn',
	'ro',
	'ru',
	'rw',
	'sg',
	'si',
	'sk',
	'sl',
	'sm',
	'sn',
	'so',
	'sq',
	'sr',
	'ss',
	'st',
	'sv',
	'sw',
	'ta',
	'tg',
	'th',
	'ti',
	'tk',
	'tl',
	'tn',
	'to',
	'tr',
	'ts',
	'uk',
	'ur',
	'uz',
	've',
	'vi',
	'xh',
	'zh',
	'zu'
]);

/**
 * Converts browser locale identifiers into the primary language code expected by webcomponents.
 */
export function getPrimaryLanguageCode(languageCode: string | null | undefined): string {
	return (
		languageCode?.replace('_', '-').split('-')[0]?.toLowerCase() ||
		FALLBACK_WEBCOMPONENTS_LANGUAGE_CODE
	);
}

/**
 * Returns a webcomponents-supported language code, falling back to English otherwise.
 */
export function getSupportedWebcomponentsLanguageCode(
	languageCode: string | null | undefined
): string {
	const primaryLanguageCode = getPrimaryLanguageCode(languageCode);

	if (SUPPORTED_WEBCOMPONENTS_LANGUAGE_CODES.has(primaryLanguageCode)) {
		return primaryLanguageCode;
	}

	return FALLBACK_WEBCOMPONENTS_LANGUAGE_CODE;
}

/**
 * Applies the language code without letting unsupported webcomponent locales crash the app.
 */
export function setWebcomponentsLanguageCode(
	config: Pick<HTMLElement, 'setAttribute'>,
	languageCode: string | null | undefined
): string {
	const webcomponentsLanguageCode = getSupportedWebcomponentsLanguageCode(languageCode);

	config.setAttribute('language-code', webcomponentsLanguageCode);
	return webcomponentsLanguageCode;
}
