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

/**
 * Tracks whether the user has dismissed the legal copyright warning banner
 * on the image upload step. Persisted in localStorage so it survives page refreshes.
 */
export const legalBannerDismissed = persisted<boolean>('legalBannerDismissed', false);

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
