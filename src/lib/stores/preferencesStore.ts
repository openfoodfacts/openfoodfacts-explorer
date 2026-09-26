import { persisted } from 'svelte-local-storage-store';

import type { AttributeParameters, Attribute, AttributeGroup } from '$lib/types/sdk-overrides';
export type { AttributeParameters, Attribute, AttributeGroup };

type BaseUserPreference = {
	groupId: string;
	attributeId: string;
};

// Specific preference type for attributes
export type AttributePreference = BaseUserPreference & {
	type: 'attribute';
	value: string;
};

export type TagsPreference = BaseUserPreference & {
	type: 'tags';
	tagtype: string;
	value: string[];
};

// Base type for all user preferences (can be extended with other preference types)
export type UserPreference = AttributePreference | TagsPreference;

// Combined preferences store
type PreferencesStoreData = {
	userPreferences: UserPreference[];
	classifyProductsEnabled: boolean;
};

export const personalizedSearch = persisted<PreferencesStoreData>('personalizedSearch', {
	userPreferences: [],
	classifyProductsEnabled: false
});

function getDefaultValue(attribute: Attribute): string {
	return attribute.default || 'not_important';
}

export function attributesToDefaultPreferences(
	attributeGroups: AttributeGroup[]
): AttributePreference[] {
	return attributeGroups.flatMap((group) =>
		group.attributes!.map((attr) => ({
			type: 'attribute' as const,
			groupId: group.id,
			attributeId: attr.id,
			value: getDefaultValue(attr)
		}))
	);
}

export function updateAttributePreference(preference: UserPreference) {
	personalizedSearch.update((store) => {
		const prefs = store.userPreferences;

		const existingPreferenceIndex = prefs.findIndex(
			(p) => p.groupId === preference.groupId && p.attributeId === preference.attributeId
		);

		if (existingPreferenceIndex >= 0) {
			// Update existing preference
			const newPrefs = prefs.with(existingPreferenceIndex, preference);

			return {
				...store,
				userPreferences: newPrefs
			};
		}

		return {
			...store,
			userPreferences: [...prefs, preference]
		};
	});
}

export function resetToDefaults(defaultPreferences: UserPreference[]) {
	const defaults = structuredClone(defaultPreferences);
	personalizedSearch.update((store) => ({
		...store,
		userPreferences: defaults
	}));
}

export function getPreference(
	prefs: UserPreference[],
	categoryId: string,
	attributeId: string
): UserPreference | undefined {
	return prefs.find(
		(p: UserPreference) => p.groupId === categoryId && p.attributeId === attributeId
	);
}
