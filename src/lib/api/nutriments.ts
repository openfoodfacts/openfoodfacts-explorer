import { createProductsApi } from './product';

export type Nutriments = {
	alcohol: number;
	alcohol_100g: number;
	alcohol_serving: number;
	alcohol_unit: string;
	alcohol_value: number;
	carbohydrates: number;
	carbohydrates_100g: number;
	carbohydrates_serving: number;
	carbohydrates_unit: string;
	carbohydrates_value: number;
	'carbon-footprint-from-known-ingredients_product': number;
	'carbon-footprint-from-known-ingredients_serving': number;
	energy: number;
	'energy-kcal': number;
	'energy-kcal_100g': number;
	'energy-kcal_serving': number;
	'energy-kcal_unit': string;

	'energy-kcal_value': number;

	'energy-kj': number;
	'energy-kj_100g': number;
	'energy-kj_serving': number;
	'energy-kj_unit': string;
	'energy-kj_value': number;
	energy_100g: number;
	energy_serving: number;
	energy_unit: string;

	energy_value: number;

	erythritol: number;

	erythritol_100g: number;

	erythritol_serving: number;
	erythritol_unit: string;
	erythritol_value: number;
	fat: number;
	fat_100g: number;
	fat_serving: number;
	fat_unit: string;
	fat_value: number;
	fibers: number;
	fibers_100g: number;
	fibers_serving: number;
	fibers_unit: string;
	fibers_value: number;

	'fruits-vegetables-nuts-estimate-from-ingredients_100g': number;
	'fruits-vegetables-nuts-estimate-from-ingredients_serving': number;

	proteins: number;
	proteins_100g: number;
	proteins_serving: number;
	proteins_unit: string;
	proteins_value: number;
	salt: number;
	salt_100g: number;
	salt_serving: number;
	salt_unit: string;
	salt_value: number;
	'saturated-fat': number;
	'saturated-fat_100g': number;
	'saturated-fat_serving': number;
	'saturated-fat_unit': string;
	'saturated-fat_value': number;
	sodium: number;
	sodium_100g: number;
	sodium_serving: number;
	sodium_unit: string;
	sodium_value: number;
	sugars: number;
	sugars_100g: number;
	sugars_serving: number;
	sugars_unit: string;
	sugars_value: number;

	[key: string]: number | string | undefined;
};

export const NUTRIENTS = [
	'alcohol',
	'sodium',
	'energy',
	'energy-kcal',
	'energy-kj',
	'fat',
	'proteins',
	'salt',
	'saturated-fat',
	'carbohydrates',
	'sugars',
	'fibers'
] as const;

export type NutrientKey = (typeof NUTRIENTS)[number];

export type NutrientOption = {
	id: string;
	name: string;
	unit?: string;
	displayInEditForm?: boolean;
};

type NutrientApiEntry = NutrientOption & {
	display_in_edit_form?: boolean;
	nutrients?: NutrientApiEntry[];
};

type NutrientsResponse = {
	nutrients: NutrientApiEntry[];
};

export function flattenNutrients(nutrients: NutrientApiEntry[]): NutrientOption[] {
	return nutrients.flatMap(
		({ nutrients: children, display_in_edit_form: displayInEditForm, ...nutrient }) => [
			{ ...nutrient, displayInEditForm },
			...flattenNutrients(children ?? [])
		]
	);
}

export function getSelectableNutrients(
	nutrients: NutrientOption[],
	excludedIds: ReadonlySet<string>,
	addedIds: readonly string[]
): NutrientOption[] {
	return nutrients.filter(
		(nutrient) => !excludedIds.has(nutrient.id) && !addedIds.includes(nutrient.id)
	);
}

const DERIVED_NUTRIENT_KEY_SUFFIX = /_(?:100g|serving|unit|value|modifier|product)$/;

/**
 * Creates fallback options for persisted nutrient values absent from the catalog.
 * Derived fields such as units and per-100g values do not represent separate nutrients.
 */
export function getMissingNutrientOptions(
	nutriments: Partial<Nutriments> | undefined,
	nutrientCatalog: NutrientOption[]
): NutrientOption[] {
	const knownIds = new Set(nutrientCatalog.map((nutrient) => nutrient.id));
	const missingNutrients: NutrientOption[] = [];

	for (const [id, value] of Object.entries(nutriments ?? {})) {
		if (value == null || DERIVED_NUTRIENT_KEY_SUFFIX.test(id) || knownIds.has(id)) continue;

		const unit = nutriments?.[`${id}_unit`];
		missingNutrients.push({
			id,
			name: id,
			...(typeof unit === 'string' ? { unit } : {})
		});
	}

	return missingNutrients;
}

export async function getNutrients(
	fetch: typeof globalThis.fetch,
	locale: string,
	country?: string
): Promise<NutrientOption[]> {
	const query = {
		lc: locale.toLowerCase(),
		...(country && country !== 'world' ? { cc: country.toLowerCase() } : {})
	};
	const { data, error, response } = await createProductsApi(fetch).apiv2.client.GET(
		'/cgi/nutrients.pl',
		{ params: { query } }
	);

	if (!response.ok || error) {
		throw new Error(`Failed to load nutrients (${response.status})`);
	}

	// The deployed endpoint wraps the array even though the current OpenAPI schema declares a bare array.
	const nutrients = (data as unknown as Partial<NutrientsResponse>)?.nutrients;
	if (!Array.isArray(nutrients)) {
		throw new Error('Invalid nutrients response');
	}

	return flattenNutrients(nutrients);
}
