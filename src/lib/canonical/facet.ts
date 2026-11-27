import { resolveForUrl } from '#lib/paths.js';
import { canonicalSeo, explorerUrl, openerBaseUrl } from '#lib/canonical/shared.js';
import type { UrlLocation } from '#lib/url-location.js';

type Facet = {
	facet: string;
	value?: string;
};

/** Only paginated pages (after the first) carry a `page` query parameter in the canonical. */
function withPage(url: URL, page: number | undefined) {
	if (page && page > 1) url.searchParams.set('page', String(page));
	return url.href;
}

/** Canonical on Product Opener, which serves the same `/facets/...` paths. */
export function facetOpenerCanonicalUrl(
	{ facet, value }: Facet,
	location: UrlLocation,
	page?: number
) {
	const url = openerBaseUrl(location);
	url.pathname = value
		? `/facets/${encodeURIComponent(facet)}/${encodeURIComponent(value)}`
		: `/facets/${encodeURIComponent(facet)}`;
	return withPage(url, page);
}

/** Canonical on this website, keeping the location segment of the request. */
export function facetExplorerCanonicalUrl({ facet, value }: Facet, url: URL, page?: number) {
	const path = value
		? resolveForUrl(url, '/facets/[facet]/[value]', { facet, value })
		: resolveForUrl(url, '/facets/[facet]', { facet });
	return withPage(explorerUrl(path), page);
}

/** SEO data for a facet page, following `SEO_CANONICAL_TARGET`. */
export function facetSeo(facet: Facet, url: URL, page?: number) {
	return canonicalSeo(url, {
		opener: (location) => facetOpenerCanonicalUrl(facet, location, page),
		explorer: () => facetExplorerCanonicalUrl(facet, url, page)
	});
}
