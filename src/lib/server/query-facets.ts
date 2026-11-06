import { QueryApi, type QueryFacetField } from '@openfoodfacts/openfoodfacts-nodejs';

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
	const [values, count] = await Promise.all([
		client.getFacetValues(field, { limit: pageSize, skip: (page - 1) * pageSize }),
		client.countFacetValues(field)
	]);
	return { values, count };
}
