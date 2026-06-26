const FALLBACK_WEBCOMPONENTS_LANGUAGE_CODE = 'en';

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
 * Applies the language code without letting unsupported webcomponent locales crash the app.
 */
export function setWebcomponentsLanguageCode(
	config: Pick<HTMLElement, 'setAttribute'>,
	languageCode: string | null | undefined
): string {
	const primaryLanguageCode = getPrimaryLanguageCode(languageCode);

	try {
		config.setAttribute('language-code', primaryLanguageCode);
		return primaryLanguageCode;
	} catch (error) {
		if (primaryLanguageCode === FALLBACK_WEBCOMPONENTS_LANGUAGE_CODE) {
			throw error;
		}

		config.setAttribute('language-code', FALLBACK_WEBCOMPONENTS_LANGUAGE_CODE);
		return FALLBACK_WEBCOMPONENTS_LANGUAGE_CODE;
	}
}
