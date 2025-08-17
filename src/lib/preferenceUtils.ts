import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';
import {
	generatePreferencesFromGroups,
	type DEFAULT_PREFERENCES,
	type AttributeGroup
} from '$lib/stores/preferencesStore';

// Type for the API response which has optional fields
type ApiAttributeGroup = {
	id?: string;
	name?: string;
	attributes?: {
		id?: string;
		name?: string;
		icon_url?: string;
		setting_name?: string;
		setting_note?: string;
		default?: string;
		panel_id?: string;
		values?: string[];
	}[];
	warning?: string;
};

export function convertApiToAttributeGroups(
	apiAttributeGroups: ApiAttributeGroup[]
): AttributeGroup[] {
	return apiAttributeGroups.map((group) => ({
		id: group.id || '',
		name: group.name || '',
		attributes: (group.attributes || []).map((attr) => ({
			id: attr.id || '',
			name: attr.name || '',
			icon_url: attr.icon_url,
			setting_name: attr.setting_name,
			setting_note: attr.setting_note,
			panel_id: attr.panel_id,
			default: attr.default,
			values: attr.values || []
		})),
		warning: group.warning
	}));
}

export async function fetchAndGenerateDefaults(
	fetch: typeof window.fetch
): Promise<DEFAULT_PREFERENCES> {
	const off = new OpenFoodFacts(fetch);
	const apiAttributeGroups: ApiAttributeGroup[] = await off.getAttributeGroups();
	const attributeGroups = convertApiToAttributeGroups(apiAttributeGroups);
	return generatePreferencesFromGroups(attributeGroups);
}
