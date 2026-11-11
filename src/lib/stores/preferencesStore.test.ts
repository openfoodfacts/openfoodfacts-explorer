import { get } from 'svelte/store';
import { beforeEach, describe, expect, it } from 'vitest';

import {
	attributesToDefaultPreferences,
	personalizedSearch,
	resetToDefaults,
	updateAttributePreference,
	type AttributeGroup
} from './preferencesStore';

const GROUPS = [
	{
		id: 'nutritional_quality',
		attributes: [{ id: 'nutriscore', default: 'very_important' }, { id: 'low_salt' }]
	},
	{ id: 'labels', attributes: [{ id: 'labels_organic' }] }
] as AttributeGroup[];

describe('attributesToDefaultPreferences', () => {
	it('uses the server default and falls back to not_important', () => {
		expect(attributesToDefaultPreferences(GROUPS)).toEqual([
			{
				type: 'attribute',
				groupId: 'nutritional_quality',
				attributeId: 'nutriscore',
				value: 'very_important'
			},
			{
				type: 'attribute',
				groupId: 'nutritional_quality',
				attributeId: 'low_salt',
				value: 'not_important'
			},
			{
				type: 'attribute',
				groupId: 'labels',
				attributeId: 'labels_organic',
				value: 'not_important'
			}
		]);
	});
});

describe('resetToDefaults', () => {
	beforeEach(() => {
		personalizedSearch.set({ userPreferences: [], classifyProductsEnabled: true });
	});

	it('replaces the saved choices and keeps the classification toggle', () => {
		updateAttributePreference({
			type: 'attribute',
			groupId: 'labels',
			attributeId: 'labels_organic',
			value: 'mandatory'
		});
		updateAttributePreference({
			type: 'tags',
			tagtype: 'allergens',
			groupId: 'allergens',
			attributeId: 'unwanted',
			value: ['en:gluten']
		});

		const defaults = attributesToDefaultPreferences(GROUPS);
		resetToDefaults(defaults);

		const store = get(personalizedSearch);
		expect(store.userPreferences).toEqual(defaults);
		expect(store.classifyProductsEnabled).toBe(true);
	});

	it('does not share objects with the list it was given', () => {
		const defaults = attributesToDefaultPreferences(GROUPS);
		resetToDefaults(defaults);
		updateAttributePreference({ ...defaults[0], value: 'mandatory' });

		expect(defaults[0].value).toBe('very_important');
	});
});
