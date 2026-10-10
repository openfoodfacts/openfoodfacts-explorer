export const CHART_FIELDS = [
	'nutrition_grades',
	'environmental_score_grade',
	'nova_group',
	'categories',
	'labels',
	'brands',
	'countries',
	'stores',
	'allergens',
	'traces',
	'additives',
	'ingredients_analysis'
];

export const DEFAULT_CHART_FIELDS = ['nutrition_grades', 'environmental_score_grade', 'nova_group'];

/** Known chart fields from a comma-separated `charts` URL parameter, without duplicates. */
export function parseChartFields(param: string | null): string[] {
	if (param == null) return DEFAULT_CHART_FIELDS;
	return [...new Set(param.split(','))].filter((field) => CHART_FIELDS.includes(field));
}
