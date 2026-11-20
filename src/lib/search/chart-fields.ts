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

/** Returns the chart fields a search-a-licious validation error rejects ("... in facets/charts: <field>"). */
export function rejectedChartFields(error: unknown): string[] {
	const text = JSON.stringify(error ?? '');
	return [...text.matchAll(/in facets\/charts: ([\w.]+)/g)].map((match) => match[1]);
}

/**
 * Parses the `charts` URL parameter into the chart fields to show, dropping unknown fields and
 * duplicates. Returns the default fields when the parameter is missing.
 */
export function parseChartFields(param: string | null): string[] {
	if (param == null) return [...DEFAULT_CHART_FIELDS];
	return [...new Set(param.split(','))].filter((field) => CHART_FIELDS.includes(field));
}
