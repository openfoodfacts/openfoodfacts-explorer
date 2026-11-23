import { ORIGIN, SEO_CANONICAL_TARGET } from '$app/env/public';
import { resolveForUrl } from '#lib/paths.js';
import { WEBSITE_FLAVOR_METADATA } from '#lib/flavor.js';
import { formatUrlLocation, parseUrlLocation, type UrlLocation } from '#lib/url-location.js';

type Product = {
	code?: string;
	product_type?: string;
};

export function productOpenerCanonicalUrl(product: Product, { country, language }: UrlLocation) {
	const { code, product_type } = product;
	if (product_type !== 'food' || !code || !/^\d+$/.test(code)) return undefined;

	// Product Opener uses UK in its country taxonomy for the ISO country GB.
	const subdomain = formatUrlLocation(country === 'GB' ? 'UK' : country, language);
	const url = new URL(WEBSITE_FLAVOR_METADATA.food.apiBaseUrl);
	url.hostname = url.hostname.replace(/^world\./, `${subdomain}.`);
	// Product Opener resolves the country alias and localized slug.
	url.pathname = `/product/${code}`;
	return url.href;
}

export function productSeo(product: Product, url: URL, barcode: string) {
	const location = parseUrlLocation(url.pathname);
	if (!location) return {};

	if (SEO_CANONICAL_TARGET === 'product-opener') {
		return { canonicalUrl: productOpenerCanonicalUrl(product, location) };
	}

	const origin = ORIGIN;
	if (!origin?.startsWith('https://')) {
		throw new Error('ORIGIN must be the public HTTPS origin when SEO_CANONICAL_TARGET is explorer');
	}

	const productPage = '/products/[barcode]';
	const canonicalUrl = new URL(
		resolveForUrl(url, productPage, { barcode: product.code || barcode }),
		origin
	).href;
	return { canonicalUrl };
}
