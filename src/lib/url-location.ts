import ISO31661 from 'iso-3166-1';
import ISO6391 from 'iso-639-1';

/**
 * We use the first segment of the URL to encode the location (language and country) for the current page.
 *
 * The segment is in the format `[language-]country`, where `language` is a two-letter ISO 639-1 code
 * and `country` is a two-letter ISO 3166-1 alpha-2 code.
 *
 * Examples:
 * - `/en-ww/...` for English (world)
 * - `/fr-ww/...` for French (world)
 * - `/ww/...` for world (no language specified)
 *
 * The location segment is required for all pages, and is stripped before SvelteKit matches the route.
 */

/** Location encoded in the required first URL segment (for example `en-ww`). */
export type UrlLocation = {
	language?: string;
	country: string;
};

const LOCATION_SEGMENT = /^(?:([a-z]{2})-)?([a-z]{2})$/i;
const LANGUAGE_CODES: Set<string> = new Set(ISO6391.getAllCodes());
const COUNTRY_CODES = new Set(ISO31661.all().map(({ alpha2 }) => alpha2.toLowerCase()));

export function parseUrlLocation(pathname: string): UrlLocation | undefined {
	const segment = pathname.split('/')[1];
	if (!segment) return undefined;

	const match = LOCATION_SEGMENT.exec(segment);
	if (!match) return undefined;
	const language = match[1]?.toLowerCase();
	const country = match[2].toLowerCase();
	if (language && !LANGUAGE_CODES.has(language)) return undefined;
	if (country !== 'ww' && !COUNTRY_CODES.has(country)) return undefined;

	return {
		...(language ? { language } : {}),
		country: country === 'ww' ? 'world' : country.toUpperCase()
	};
}

/** Create the URL segment for a saved language and country preference. */
export function formatUrlLocation(language: string | undefined, country: string): string {
	const countryCode = country.toLowerCase() === 'world' ? 'ww' : country.toLowerCase();
	return `${language ? `${language.toLowerCase()}-` : ''}${countryCode}`;
}

/** Remove the required leading location segment before SvelteKit matches the route. */
export function stripUrlLocation(pathname: string): string {
	if (!parseUrlLocation(pathname)) return pathname;
	const nextSlash = pathname.indexOf('/', 1);
	return nextSlash < 0 ? '/' : pathname.slice(nextSlash);
}
