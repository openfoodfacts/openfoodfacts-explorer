import { resolveForUrl } from '#lib/paths.js';
import { canonicalSeo, explorerUrl, openerBaseUrl } from '#lib/canonical/shared.js';
import type { UrlLocation } from '#lib/url-location.js';

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
	return canonicalSeo(url, {
		opener: (location) => productOpenerCanonicalUrl(product, location),
		explorer: () =>
			explorerUrl(resolveForUrl(url, '/products/[barcode]', { barcode: product.code || barcode }))
				.href
	});
}
