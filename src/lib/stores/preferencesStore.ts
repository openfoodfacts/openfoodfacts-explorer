import { persisted } from 'svelte-local-storage-store';
import { getAttributeGroups } from '$lib/api/attributes';

export type Attribute = {
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

export type AttributeGroup = {
	id: string;
	name: string;
	attributes: Attribute[];
	warning?: string;
};

export type UserPreferences = Record<string, Record<string, string>>;

function generateDefaultPreferences(): UserPreferences {
	const attributeGroups = getAttributeGroups();

	const getDefaultValue = (attribute: Attribute): string => {
		return attribute.default || 'not_important';
	};

	// Build preferences dynamically from the API data
	const defaultPreferencesMap: UserPreferences = {};

	for (const group of attributeGroups) {
		defaultPreferencesMap[group.id] = {};

		for (const attr of group.attributes) {
			defaultPreferencesMap[group.id][attr.id] = getDefaultValue(attr);
		}
	}

	return defaultPreferencesMap;
}

export const defaultPreferences: UserPreferences = generateDefaultPreferences();

// Export attribute groups for use in components
export const attributeGroups = getAttributeGroups();

export function updatePreference(category: string, preference: string, value: string) {
	userPreferences.update((prefs: UserPreferences) => {
		const newPrefs = {
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
	onPreferenceChange?: (category: string, preference: string, value: string) => void
) {
	const defaults = structuredClone(defaultPreferences);
	userPreferences.set(defaults);

	// Notify about all preference changes if callback provided
	if (onPreferenceChange) {
		for (const [category, prefs] of Object.entries(defaults)) {
			for (const [preference, value] of Object.entries(prefs)) {
				onPreferenceChange(category, preference, value);
			}
		}
	}
}

export const userPreferences = persisted('userPreferences', defaultPreferences);

// Store for classify products toggle state
export const classifyProductsEnabled = persisted('classifyProductsEnabled', false);
