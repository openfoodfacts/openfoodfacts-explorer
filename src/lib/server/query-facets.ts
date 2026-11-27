import {
	QueryApi,
	type QueryFacetField,
	type QueryFacetValue,
	type QueryFilter
} from '@openfoodfacts/openfoodfacts-nodejs';
import { USER_AGENT } from '#lib/const.js';
import type { FacetPair } from '#lib/api/facets.js';

// TODO: Use the SDK's facet-to-Query-field mapping if it exposes one.
export const QUERY_FACETS: Record<string, QueryFacetField> = {
	categories: 'categories_tags',
	countries: 'countries_tags',
	labels: 'labels_tags',
	origins: 'origins_tags',
	brands: 'brands_tags',
	'nutrition-grades': 'nutrition_grades_tags',
	'nova-groups': 'nova_groups_tags',
	'environmental-score': 'ecoscore_tags',
	packaging: 'packaging_tags',
	'manufacturing-places': 'manufacturing_places_tags',
	'packager-codes': 'emb_codes_tags',
	ingredients: 'ingredients_tags',
	additives: 'additives_tags',
	vitamins: 'vitamins_tags',
	minerals: 'minerals_tags',
	'amino-acids': 'amino_acids_tags',
	nucleotides: 'nucleotides_tags',
	'other-nutritional-substances': 'other_nutritional_substances_tags',
	allergens: 'allergens_tags',
	traces: 'traces_tags',
	misc: 'misc_tags',
	languages: 'languages_tags',
	states: 'states_tags',
	'data-sources': 'data_sources_tags',
	'entry-dates': 'entry_dates_tags',
	'last-edit-dates': 'last_edit_dates_tags',
	'last-check-dates': 'last_check_dates_tags',
	teams: 'teams_tags'
};

// TODO: Replace this workaround with QueryApi.getFacetValues once the SDK applies skip before limit.
async function getFacetValuesPage(
	fetch: typeof globalThis.fetch,
	queryUrl: string,
	field: QueryFacetField,
	limit: number,
	skip: number,
	filter: QueryFilter
): Promise<QueryFacetValue[]> {
	if (!Number.isInteger(limit) || limit <= 0)
		throw new RangeError('limit must be a positive integer');
	if (!Number.isInteger(skip) || skip < 0)
		throw new RangeError('skip must be a non-negative integer');
	const response = await fetch(`${queryUrl.replace(/\/$/, '')}/aggregate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
		body: JSON.stringify([
			{ $match: filter },
			{ $group: { _id: `$${field}` } },
			{ $skip: skip },
			{ $limit: limit }
		])
	});
	if (!response.ok) throw new Error(`Query API error: HTTP ${response.status}`);
	return (await response.json()) as QueryFacetValue[];
}

/**
 * Count the products for one page of a facet's values.
 *
 * @param filter only count products that match it, e.g. { brands_tags: 'ferrero' }
 * @returns the values and their total, or null when Query can't serve this facet
 */
export async function queryFacetCounts(
	fetch: typeof globalThis.fetch,
	queryUrl: string,
	facet: string,
	page: number,
	pageSize: number,
	filter: QueryFilter = {}
) {
	const field = Object.hasOwn(QUERY_FACETS, facet) ? QUERY_FACETS[facet] : undefined;
	if (!queryUrl || !field) return null;

	const client = new QueryApi(fetch, { baseUrl: queryUrl });
	// Query currently returns either the paginated values or their total, so both
	// requests are needed. Its PostgreSQL backend could return both in one query
	// using COUNT(*) OVER (), with special handling for pages beyond the end.
	const skip = (page - 1) * pageSize;
	const valuesPromise = getFacetValuesPage(fetch, queryUrl, field, pageSize, skip, filter);
	const countPromise = client.countFacetValues(field, { filter });
	const [values, count] = await Promise.all([valuesPromise, countPromise]);
	return { values, count };
}

/**
 * The most common values of a facet for the products that match the filter.
 *
 * @returns up to `limit` values with their product counts, or null when Query can't serve this facet
 */
export async function queryTopFacetValues(
	fetch: typeof globalThis.fetch,
	queryUrl: string,
	facet: string,
	limit: number,
	filter: QueryFilter
) {
	const field = Object.hasOwn(QUERY_FACETS, facet) ? QUERY_FACETS[facet] : undefined;
	if (!queryUrl || !field) return null;
	return getFacetValuesPage(fetch, queryUrl, field, limit, 0, filter);
}

/** Whether a facet is one Explorer knows, i.e. it has a Query field. */
export function isKnownFacet(facet: string): boolean {
	return Object.hasOwn(QUERY_FACETS, facet);
}

/**
 * Build one Query filter that matches every facet/value pair.
 *
 * @returns the filter,
 * or null when a facet has no Query field
 */
export function getQueryFilter(pairs: FacetPair[]): Record<string, string> | null {
	const filter: Record<string, string> = {};
	for (const pair of pairs) {
		if (!isKnownFacet(pair.facet)) return null;
		filter[QUERY_FACETS[pair.facet]] = pair.value;
	}
	return filter;
}

export async function queryAllFacetValues(
	fetch: typeof globalThis.fetch,
	queryUrl: string,
	facet: string,
	filter: QueryFilter = {}
) {
	const field = Object.hasOwn(QUERY_FACETS, facet) ? QUERY_FACETS[facet] : undefined;
	if (!queryUrl || !field) return null;
	return new QueryApi(fetch, { baseUrl: queryUrl }).getFacetValues(field, { filter });
}
