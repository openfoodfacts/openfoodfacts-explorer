export const FACET_SEARCH_FIELDS: Record<string, string> = {
	packaging: 'packagings.material',
	packaging_shapes: 'packagings.shape',
	packaging_recycling: 'packagings.recycling',
	ingredients: 'ingredients_tags',
	ingredients_analysis: 'ingredients_analysis',
	other_nutritional_substances: 'other_nutritional_substances_tags',
	data_quality_warnings: 'data_quality_warnings',
	data_quality_errors: 'data_quality_errors_tags',
	popularity_tags: 'popularity_tags',
	misc: 'misc_tags',
	contributors: 'creator',
	owner: 'owner',
	photographers: 'photographers'
};

const FACET_KEY_TO_SEARCH_FIELD = new Map(Object.entries(FACET_SEARCH_FIELDS));

const SEARCH_FIELD_TO_FACET_KEY = new Map(
	Object.entries(FACET_SEARCH_FIELDS).map(([key, field]) => [field, key])
);

export function getSearchFieldForFacet(facetKey: string): string {
	return FACET_KEY_TO_SEARCH_FIELD.get(facetKey) || facetKey;
}

export function getFacetKeyForSearchField(searchField: string): string {
	return SEARCH_FIELD_TO_FACET_KEY.get(searchField) || searchField;
}
