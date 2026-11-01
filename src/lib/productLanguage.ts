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

export type ProductLanguage = {
	code: string;
	name: string;
};

/**
 * Returns the languages a product has data for, sorted alphabetically by
 * their display name so users can quickly find the language they want.
 */
export function getSortedProductLanguages(
	languagesCodes: Record<string, number> | null | undefined,
	getName: (code: string) => string,
	locale?: string
): ProductLanguage[] {
	const collator = new Intl.Collator(locale, { sensitivity: 'base' });
	return Object.keys(languagesCodes ?? {})
		.filter((code) => LANGUAGE_CODE_REGEX.test(code))
		.map((code) => ({ code, name: getName(code) }))
		.sort((a, b) => collator.compare(a.name, b.name) || a.code.localeCompare(b.code));
}
