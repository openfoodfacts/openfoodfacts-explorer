import { getFacetPairsPath, type FacetPair } from '#lib/api/facets.js';
import { withLocationPrefix } from '#lib/location-link.js';
import { parseUrlLocation } from '#lib/url-location.js';

type FacetLinkOptions = {
	/** A facet to list for the pairs, e.g. "categories" in /facets/brands/ferrero/categories */
	listFacet?: string;
	/** The search part, e.g. "?page=2" */
	query?: string;
};

/**
 * Link to a facet page for these pairs, keeping the location prefix of the current page, e.g. /fr-fr.
 *
 * @param pathname the path of the current page
 */
export function facetPairsHref(
	pairs: FacetPair[],
	pathname: string,
	options: FacetLinkOptions = {}
): string {
	// getFacetPairsPath encodes each value, so a "#" in a value stays in the path
	let path = getFacetPairsPath(pairs);
	if (options.listFacet) {
		path += `/${encodeURIComponent(options.listFacet)}`;
	}
	if (options.query) {
		path += options.query;
	}

	const location = parseUrlLocation(pathname);
	return withLocationPrefix(path, location, pathname);
}
