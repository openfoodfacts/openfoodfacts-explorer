import { formatUrlLocation, type UrlLocation } from '#lib/url-location.js';

/** Add the active location prefix to an internal link target. */
export function withLocationPrefix(href: string, location?: UrlLocation): string {
	if (!location) return href;

	const prefix = `/${formatUrlLocation(location.language, location.country)}`;
	if (!href.startsWith('/') || href.startsWith('//')) return href;

	return `${prefix}${href === '/' ? '' : href}`;
}
