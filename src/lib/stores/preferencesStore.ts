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

// Specific preference type for attributes
export type AttributePreference = {
	type: 'attribute';
	id: string;
	categoryId: string;
	attributeId: string;
	value: string;
};

// Base type for all user preferences (can be extended with other preference types)
export type UserPreference = AttributePreference;

export type UserPreferences = UserPreference[];

function generateDefaultPreferences(): UserPreferences {
	const attributeGroups = getAttributeGroups();

	const getDefaultValue = (attribute: Attribute): string => {
		return attribute.default || 'not_important';
	};

	// Build preferences dynamically from the API data
	const defaultPreferencesArray: UserPreferences = [];

	for (const group of attributeGroups) {
		for (const attr of group.attributes) {
			const preference: UserPreference = {
				type: 'attribute',
				id: `${group.id}.${attr.id}`,
				categoryId: group.id,
				attributeId: attr.id,
				value: getDefaultValue(attr)
			};
			defaultPreferencesArray.push(preference);
		}
	}

	return defaultPreferencesArray;
}

export const defaultPreferences: UserPreferences = generateDefaultPreferences();

// Export attribute groups for use in components
export const attributeGroups = getAttributeGroups();

export function updatePreference(category: string, preference: string, value: string) {
	userPreferences.update((prefs: UserPreferences) => {
		const preferenceId = `${category}.${preference}`;
		const existingPreferenceIndex = prefs.findIndex(p => p.id === preferenceId);
		
		if (existingPreferenceIndex >= 0) {
			// Update existing preference
			const newPrefs = [...prefs];
			newPrefs[existingPreferenceIndex] = {
				...newPrefs[existingPreferenceIndex],
				value
			};
			return newPrefs;
		} else {
			// Add new preference
			const newPreference: UserPreference = {
				type: 'attribute',
				id: preferenceId,
				categoryId: category,
				attributeId: preference,
				value
			};
			return [...prefs, newPreference];
		}
	});
}

export function resetToDefaults(
	onPreferenceChange?: (category: string, preference: string, value: string) => void
) {
	const defaults = structuredClone(defaultPreferences);
	userPreferences.set(defaults);

	// Notify about all preference changes if callback provided
	if (onPreferenceChange) {
		for (const pref of defaults) {
			if (pref.type === 'attribute') {
				onPreferenceChange(pref.categoryId, pref.attributeId, pref.value);
			}
		}
	}
}

// Helper function to get preference value by category and attribute
export function getPreferenceValue(prefs: UserPreferences, category: string, attribute: string): string {
	const preferenceId = `${category}.${attribute}`;
	const preference = prefs.find(p => p.id === preferenceId);
	return preference?.value || 'not_important';
}

// Helper function to convert array preferences to old object format for backward compatibility
export function preferencesToObject(prefs: UserPreferences): Record<string, Record<string, string>> {
	const result: Record<string, Record<string, string>> = {};
	
	for (const pref of prefs) {
		if (pref.type === 'attribute') {
			if (!result[pref.categoryId]) {
				result[pref.categoryId] = {};
			}
			result[pref.categoryId][pref.attributeId] = pref.value;
		}
	}
	
	return result;
}

export const userPreferences = persisted<UserPreferences>('userPreferences', []);

// Store for classify products toggle state
export const classifyProductsEnabled = persisted('classifyProductsEnabled', false);
