import type { PageLoad } from './$types';
import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';
import type { AttributeGroup } from '$lib/stores/preferencesStore';

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

function convertApiToAttributeGroups(apiAttributeGroups: ApiAttributeGroup[]): AttributeGroup[] {
	return apiAttributeGroups.map((group) => ({
		id: group.id,
		name: group.name,
		warning: group.warning,
		attributes: group.attributes?.map((attr) => ({
			id: attr.id,
			name: attr.name,
			values: attr.values,
			icon_url: attr.icon_url,
			setting_name: attr.setting_name,
			setting_note: attr.setting_note,
			panel_id: attr.panel_id,
			default: attr.default
		}))
	}));
}

export const load: PageLoad = async ({ fetch }) => {
	const off = new OpenFoodFacts(fetch);
	const attributeGroups = await off.getAttributeGroups();
	const convertedAttributeGroups = convertApiToAttributeGroups(attributeGroups);
	return { attributeGroups: convertedAttributeGroups };
};
