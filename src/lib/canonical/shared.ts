import { ORIGIN, SEO_CANONICAL_TARGET } from '$app/env/public';
import { WEBSITE_FLAVOR_METADATA } from '#lib/flavor.js';
import { formatUrlLocation, parseUrlLocation, type UrlLocation } from '#lib/url-location.js';

/** Base URL of the Product Opener (food) site for the country and language of a request. */
export function openerBaseUrl({ country, language }: UrlLocation) {
	// Product Opener uses UK in its country taxonomy for the ISO country GB.
	const subdomain = formatUrlLocation(country === 'GB' ? 'UK' : country, language);
	const url = new URL(WEBSITE_FLAVOR_METADATA.food.apiBaseUrl);
	url.hostname = url.hostname.replace(/^world\./, `${subdomain}.`);
	return url;
}

/** Public HTTPS origin of this site, required by the explorer canonical strategy. */
export function explorerOrigin() {
	if (!ORIGIN?.startsWith('https://')) {
		throw new Error('ORIGIN must be the public HTTPS origin when SEO_CANONICAL_TARGET is explorer');
	}
	return ORIGIN;
}

/** Absolute URL on this website for a path that already has its location prefix. */
export function explorerUrl(path: string) {
	return new URL(path, explorerOrigin());
}

/**
 * Pick the canonical URL following `SEO_CANONICAL_TARGET`.
 *
 * Both strategies are lazy: `explorer` is only called (and so only needs a valid `ORIGIN`) when
 * that target is configured. Pages without a location segment get no canonical.
 */
export function canonicalSeo(
	url: URL,
	strategies: {
		opener: (location: UrlLocation) => string | undefined;
		explorer: () => string;
	}
) {
	const location = parseUrlLocation(url.pathname);
	if (!location) return {};

	const canonicalUrl =
		SEO_CANONICAL_TARGET === 'product-opener' ? strategies.opener(location) : strategies.explorer();
	return { canonicalUrl };
}
