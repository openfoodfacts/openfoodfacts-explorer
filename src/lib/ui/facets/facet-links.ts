import { getFacetPairsPath, type FacetPair } from '#lib/api/facets.js';
import { withLocationPrefix } from '#lib/location-link.js';
import { parseUrlLocation } from '#lib/url-location.js';

/** Facets offered in the "Explore by" menu of a facet value page. Query can count each of them. */
export const EXPLORE_BY_FACETS = [
	'categories',
	'brands',
	'labels',
	'countries',
	'origins',
	'manufacturing-places',
	'packaging',
	'ingredients',
	'additives',
	'allergens',
	'traces',
	'nutrition-grades',
	'nova-groups',
	'environmental-score',
	'languages',
	'states'
];

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

/**
 * The search options of the current page, such as page_size and sort_by, without its page number.
 * Links to another facet page keep these options but start on its first page.
 *
 * @param search the search part of the current URL, e.g. "?page=2&sort_by=popularity"
 * @returns the query to add to a link, e.g. "?sort_by=popularity", or "" when nothing is left
 */
export function searchWithoutPage(search: string): string {
	const params = new URLSearchParams(search);
	params.delete('page');
	if (params.size === 0) {
		return '';
	}
	return `?${params}`;
}
