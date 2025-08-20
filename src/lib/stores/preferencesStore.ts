import { persisted } from 'svelte-local-storage-store';

export type Attribute = {
	id?: string;
	name?: string;
	icon_url?: string;
	setting_name?: string;
	setting_note?: string;
	description?: string;
	description_short?: string;
	panel_id?: string;
	default?: string;
	values?: string[];
};

export type AttributeGroup = {
	id?: string;
	name?: string;
	attributes?: Attribute[];
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

export const personalizedSearch = persisted<PreferencesStoreData>('personalizedSearch', {
	userPreferences: [],
	classifyProductsEnabled: false
});


function getDefaultValue(attribute: Attribute): string {
	return attribute.default || 'not_important';
}

export function generatePreferencesFromGroups(
	attributeGroups: AttributeGroup[]
): UserPreferences {
	return attributeGroups.flatMap(group => 
		group.attributes!.map(attr => ({
			type: 'attribute' as const,
			id: `${group.id!}.${attr.id!}`,
			categoryId: group.id!,
			attributeId: attr.id!,
			value: getDefaultValue(attr)
		}))
	);
}

export function updatePreference(category: string, preference: string, value: string) {
	personalizedSearch.update((store) => {
		const prefs = store.userPreferences;
		const preferenceId = `${category}.${preference}`;
		const existingPreferenceIndex = prefs.findIndex((p: UserPreference) => p.id === preferenceId);

		if (existingPreferenceIndex >= 0) {
			// Update existing preference
			const newPrefs = [...prefs];
			newPrefs[existingPreferenceIndex] = {
				...newPrefs[existingPreferenceIndex],
				value
			};
			return {
				...store,
				userPreferences: newPrefs
			};
		}
		
		const newPreference: UserPreference = {
			type: 'attribute',
			id: preferenceId,
			categoryId: category,
			attributeId: preference,
			value
		};
		return {
			...store,
			userPreferences: [...prefs, newPreference]
		};
	});
}

export function resetToDefaults(defaultPreferences: UserPreferences) {
	const defaults = structuredClone(defaultPreferences);
	personalizedSearch.update((store) => ({
		...store,
		userPreferences: defaults
	}));
}

// Helper function to get preference value by category and attribute
export function getPreferenceValue(
	prefs: UserPreferences,
	category: string,
	attribute: string
): string {
	const preferenceId = `${category}.${attribute}`;
	const preference = prefs.find((p: UserPreference) => p.id === preferenceId);
	return preference?.value || 'not_important';
}

// Combined preferences store
type PreferencesStoreData = {
	userPreferences: UserPreferences;
	classifyProductsEnabled: boolean;
};