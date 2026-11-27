import { SEO_CANONICAL_TARGET } from '$app/env/public';
import { resolveForUrl } from '#lib/paths.js';
import { explorerOrigin, openerBaseUrl } from '#lib/canonical/shared.js';
import { parseUrlLocation, type UrlLocation } from '#lib/url-location.js';

type Product = {
	code?: string;
	product_type?: string;
};

export function productOpenerCanonicalUrl(product: Product, location: UrlLocation) {
	const { code, product_type } = product;
	if (product_type !== 'food' || !code || !/^\d+$/.test(code)) return undefined;

	const url = openerBaseUrl(location);
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

	const origin = explorerOrigin();

	const productPage = '/products/[barcode]';
	const canonicalUrl = new URL(
		resolveForUrl(url, productPage, { barcode: product.code || barcode }),
		origin
	).href;
	return { canonicalUrl };
}
