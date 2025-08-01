import { persisted } from 'svelte-persisted-store';
import { getAttributeGroups } from '$lib/api/attributes';

export type NutritionalQuality = {
	nutriScore: string;
	saltInLowQuantity: string;
	sugarsInLowQuantity: string;
	fatInLowQuantity: string;
	saturatedFatInLowQuantity: string;
};

export type FoodProcessing = {
	novaGroup: string;
	noOrFewAdditives: string;
};

export type Allergens = {
	withoutGluten: string;
	withoutMilk: string;
	withoutEggs: string;
	withoutNuts: string;
	withoutPeanuts: string;
	withoutSesameSeeds: string;
	withoutSoybeans: string;
	withoutCelery: string;
	withoutMustard: string;
	withoutLupin: string;
	withoutFish: string;
	withoutCrustaceans: string;
	withoutMolluscs: string;
	withoutSulphurDioxideAndSulphites: string;
};

export type Ingredients = {
	vegan: string;
	vegetarian: string;
	palmOilFree: string;
};

export type Labels = {
	organicFarming: string;
	fairTrade: string;
};

export type Environment = {
	lowEnvironmentalImpact: string;
	lowRiskOfDeforestation: string;
};

export type UserPreferences = {
	nutritionalQuality: NutritionalQuality;
	foodProcessing: FoodProcessing;
	allergens: Allergens;
	ingredients: Ingredients;
	labels: Labels;
	environment: Environment;
};

type Attribute = {
	id: string;
	name: string;
	icon_url?: string;
	setting_name?: string;
	setting_note?: string;
	description?: string;
	description_short?: string;
	panel_id?: string;
	default?: string;
	values: string[];
};

type AttributeGroup = {
	id: string;
	name: string;
	attributes: Attribute[];
	warning?: string;
};

function generateDefaultPreferences(): UserPreferences {
	const attributeGroups = getAttributeGroups();

	const getDefaultValue = (attribute: Attribute | undefined): string => {
		return attribute?.default || 'not_important';
	};

	const findAttribute = (groupId: string, attributeId: string): Attribute | undefined => {
		const group = attributeGroups.find((g: AttributeGroup) => g.id === groupId);
		return group?.attributes.find((attr) => attr.id === attributeId);
	};

	return {
		nutritionalQuality: {
			nutriScore: getDefaultValue(findAttribute('nutritional_quality', 'nutriscore')),
			saltInLowQuantity: getDefaultValue(findAttribute('nutritional_quality', 'low_salt')),
			sugarsInLowQuantity: getDefaultValue(findAttribute('nutritional_quality', 'low_sugars')),
			fatInLowQuantity: getDefaultValue(findAttribute('nutritional_quality', 'low_fat')),
			saturatedFatInLowQuantity: getDefaultValue(
				findAttribute('nutritional_quality', 'low_saturated_fat')
			)
		},
		foodProcessing: {
			novaGroup: getDefaultValue(findAttribute('processing', 'nova')),
			noOrFewAdditives: getDefaultValue(findAttribute('processing', 'additives'))
		},
		allergens: {
			withoutGluten: getDefaultValue(findAttribute('allergens', 'allergens_no_gluten')),
			withoutMilk: getDefaultValue(findAttribute('allergens', 'allergens_no_milk')),
			withoutEggs: getDefaultValue(findAttribute('allergens', 'allergens_no_eggs')),
			withoutNuts: getDefaultValue(findAttribute('allergens', 'allergens_no_nuts')),
			withoutPeanuts: getDefaultValue(findAttribute('allergens', 'allergens_no_peanuts')),
			withoutSesameSeeds: getDefaultValue(findAttribute('allergens', 'allergens_no_sesame_seeds')),
			withoutSoybeans: getDefaultValue(findAttribute('allergens', 'allergens_no_soybeans')),
			withoutCelery: getDefaultValue(findAttribute('allergens', 'allergens_no_celery')),
			withoutMustard: getDefaultValue(findAttribute('allergens', 'allergens_no_mustard')),
			withoutLupin: getDefaultValue(findAttribute('allergens', 'allergens_no_lupin')),
			withoutFish: getDefaultValue(findAttribute('allergens', 'allergens_no_fish')),
			withoutCrustaceans: getDefaultValue(findAttribute('allergens', 'allergens_no_crustaceans')),
			withoutMolluscs: getDefaultValue(findAttribute('allergens', 'allergens_no_molluscs')),
			withoutSulphurDioxideAndSulphites: getDefaultValue(
				findAttribute('allergens', 'allergens_no_sulphur_dioxide_and_sulphites')
			)
		},
		ingredients: {
			vegan: getDefaultValue(findAttribute('ingredients_analysis', 'vegan')),
			vegetarian: getDefaultValue(findAttribute('ingredients_analysis', 'vegetarian')),
			palmOilFree: getDefaultValue(findAttribute('ingredients_analysis', 'palm_oil_free'))
		},
		labels: {
			organicFarming: getDefaultValue(findAttribute('labels', 'labels_organic')),
			fairTrade: getDefaultValue(findAttribute('labels', 'labels_fair_trade'))
		},
		environment: {
			lowEnvironmentalImpact: getDefaultValue(findAttribute('environment', 'ecoscore')),
			lowRiskOfDeforestation: getDefaultValue(findAttribute('environment', 'forest_footprint'))
		}
	};
}

export const defaultPreferences: UserPreferences = generateDefaultPreferences();

// Export attribute groups for use in components
export const attributeGroups = getAttributeGroups();

export function updatePreference(
	category: keyof UserPreferences,
	preference: string,
	value: string
) {
	userPreferences.update((prefs: UserPreferences) => {
		const newPrefs: UserPreferences = {
			...prefs,
			[category]: {
				...prefs[category],
				[preference]: value
			}
		};

		return newPrefs;
	});
}

export function resetToDefaults(
	onReset?: (category: string, preference: string, value: string) => void
) {
	const defaults = structuredClone(defaultPreferences);
	userPreferences.set(defaults);

	if (onReset) {
		Object.entries(defaults).forEach(([category, categoryPrefs]) => {
			Object.entries(categoryPrefs).forEach(([preference, value]) => {
				onReset(category, preference, value);
			});
		});
	}
}

export const userPreferences = persisted('userPreferences', defaultPreferences, {
	syncTabs: true,
	serializer: {
		parse: (text: string) => {
			try {
				return JSON.parse(text);
			} catch {
				// If parsing fails, just return defaults
				return defaultPreferences;
			}
		},
		stringify: JSON.stringify
	}
});
