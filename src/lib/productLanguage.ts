/** Query parameter used to override the language a product page is displayed in. */
export const PRODUCT_LANGUAGE_PARAM = 'lc';

const LANGUAGE_CODE_REGEX = /^[a-z]{2}$/;

/**
 * Resolves the language code used to display a product.
 * Uses the `lc` query parameter when it is a valid two-letter language code,
 * otherwise falls back to the given language (usually the user's preference).
 */
export function resolveProductLanguage(param: string | null | undefined, fallback: string): string {
	const code = param?.trim().toLowerCase();
	if (code && LANGUAGE_CODE_REGEX.test(code)) {
		return code;
	}
	return fallback;
}

/**
 * Returns the language codes a product has data for, ordered by number of
 * filled fields (descending), then alphabetically.
 */
export function getProductLanguages(languagesCodes: Record<string, number> | null | undefined) {
	return Object.entries(languagesCodes ?? {})
		.filter(([code]) => LANGUAGE_CODE_REGEX.test(code))
		.sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b))
		.map(([code]) => code);
}
