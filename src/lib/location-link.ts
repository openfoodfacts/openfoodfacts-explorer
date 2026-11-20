import { formatUrlLocation, stripUrlLocation, type UrlLocation } from '#lib/url-location.js';

/** Add the active location prefix to an internal link target. */
export function withLocationPrefix(href: string, location?: UrlLocation, pathname = '/'): string {
	if (!location) return href;

	if (href.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(href)) return href;
	const base = new URL(stripUrlLocation(pathname), 'https://example.invalid');
	const target = new URL(href, base);
	const prefix = `/${formatUrlLocation(location.country, location.language)}`;

	return `${prefix}${target.pathname === '/' ? '' : target.pathname}${target.search}${target.hash}`;
}
