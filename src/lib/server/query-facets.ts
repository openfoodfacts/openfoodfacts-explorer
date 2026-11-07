import {
	QueryApi,
	type QueryFacetField,
	type QueryFacetValue,
	type QueryFilter
} from '@openfoodfacts/openfoodfacts-nodejs';
import { USER_AGENT } from '#lib/const.js';

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
	skip: number
): Promise<QueryFacetValue[]> {
	if (!Number.isInteger(limit) || limit <= 0)
		throw new RangeError('limit must be a positive integer');
	if (!Number.isInteger(skip) || skip < 0)
		throw new RangeError('skip must be a non-negative integer');
	const response = await fetch(`${queryUrl.replace(/\/$/, '')}/aggregate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'User-Agent': USER_AGENT },
		body: JSON.stringify([
			{ $match: {} },
			{ $group: { _id: `$${field}` } },
			{ $skip: skip },
			{ $limit: limit }
		])
	});
	if (!response.ok) throw new Error(`Query API error: HTTP ${response.status}`);
	return (await response.json()) as QueryFacetValue[];
}

export async function queryFacetCounts(
	fetch: typeof globalThis.fetch,
	queryUrl: string,
	facet: string,
	page: number,
	pageSize: number
) {
	const field = Object.hasOwn(QUERY_FACETS, facet) ? QUERY_FACETS[facet] : undefined;
	if (!queryUrl || !field) return null;

	const client = new QueryApi(fetch, { baseUrl: queryUrl });
	// Query currently returns either the paginated values or their total, so both
	// requests are needed. Its PostgreSQL backend could return both in one query
	// using COUNT(*) OVER (), with special handling for pages beyond the end.
	const valuesPromise = getFacetValuesPage(fetch, queryUrl, field, pageSize, (page - 1) * pageSize);
	const countPromise = client.countFacetValues(field);
	const [values, count] = await Promise.all([valuesPromise, countPromise]);
	return { values, count };
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
