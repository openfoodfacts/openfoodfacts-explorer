import { resolveAvailableLocale } from '#lib/i18n/index.js';
import { parseUrlLocation } from '#lib/url-location.js';

const UNPREFIXED_PATH_ALLOWLIST = [
	/^\/(?:health|site\.webmanifest)$/,
	/^\/oauth\/(?:login|logout)\/callback$/,
	/^\/(?:_app|assets)\//,
	/^\/(?:favicon\.ico|Placeholder\.svg|login\.svg)$/
];

/** Return a location-prefixed destination for legacy paths, if needed. */
export function locationRedirect(url: URL, acceptLanguage: string | null): string | undefined {
	if (
		url.pathname === '/' ||
		parseUrlLocation(url.pathname) ||
		UNPREFIXED_PATH_ALLOWLIST.some((pattern) => pattern.test(url.pathname))
	)
		return undefined;

	const language = resolveAvailableLocale(acceptLanguage?.split(',')[0]?.split(';')[0].trim())
		.split('-')[0]
		.toLowerCase();
	return `/world-${language}${url.pathname}${url.search}`;
}
