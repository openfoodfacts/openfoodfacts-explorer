import type { AttributeGroupV2 } from '@openfoodfacts/openfoodfacts-nodejs';
import { persisted } from 'svelte-local-storage-store';

export type AttributeParameters = { type: 'tags'; id: string; name: string; tagtype: string };

// FIXME: Remove this type when we fix all type errors in SDK
// - `parameters` field missing
// - `values` field missing
// - `id` field should not be optional
export type Attribute = Omit<NonNullable<AttributeGroupV2[number]['attributes']>[number], 'id'> & {
	id: string;
	parameters: AttributeParameters[];
	values: string[];
	description?: string;
};

// FIXME: Remove this type when we fix all type errors in SDK
// - [number] should not be necessary. The API should return a single object, not an array.
export type AttributeGroup = Omit<AttributeGroupV2[number], 'attributes' | 'id'> & {
	id: string;
	warning?: string;
	attributes?: Attribute[];
};

// Specific preference type for attributes
export type AttributePreference = {
	type: 'attribute';
	id: string;
	categoryId: string;
	attributeId: string;
	value: string;
};

export type TagsPreference = {
	type: 'tags';
	id: string;
	tagType: string;
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
			id: `${group.id!}.${attr.id!}`,
			categoryId: group.id!,
			attributeId: attr.id!,
			value: getDefaultValue(attr)
		}))
	);
}

export function updateAttributePreference(category: string, preference: string, value: string) {
	personalizedSearch.update((store) => {
		const prefs = store.userPreferences;
		const preferenceId = `${category}.${preference}`;

		const existingPreferenceIndex = prefs
			.filter((p: UserPreference): p is AttributePreference => p.type === 'attribute')
			.findIndex((p: UserPreference) => p.id === preferenceId);

		if (existingPreferenceIndex >= 0) {
			// Update existing preference
			const oldPreference = prefs[existingPreferenceIndex] as AttributePreference;
			const newPref = { ...oldPreference, value };
			const newPrefs = prefs.with(existingPreferenceIndex, newPref);

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

export function resetToDefaults(defaultPreferences: UserPreference[]) {
	const defaults = structuredClone(defaultPreferences);
	personalizedSearch.update((store) => ({
		...store,
		userPreferences: defaults
	}));
}

// Helper function to get preference value by category and attribute
export function getAttributePreferenceValue(
	prefs: UserPreference[],
	category: string,
	attribute: string
): string {
	const preferenceId = `${category}.${attribute}`;
	const preference = prefs
		.filter((p: UserPreference): p is AttributePreference => p.type === 'attribute')
		.find((p: UserPreference) => p.id === preferenceId);
	return preference?.value ?? 'not_important';
}
