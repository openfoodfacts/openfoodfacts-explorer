import { ORIGIN } from '$app/env/public';
import { WEBSITE_FLAVOR_METADATA } from '#lib/flavor.js';
import { formatUrlLocation, type UrlLocation } from '#lib/url-location.js';

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
