import type { KnowledgePanelTableRow as SDKKnowledgePanelTableRow } from '@openfoodfacts/openfoodfacts-nodejs';
import type { AttributeGroupV2 } from '@openfoodfacts/openfoodfacts-nodejs';

/**
 * Temporary SDK type overrides until @openfoodfacts/openfoodfacts-nodejs package exports are complete.
 */

export type PackagingTaxonomyTag = {
	id?: string;
	lc_name?: string;
};

export type PackagingComponent = {
	number_of_units?: number;
	shape?: PackagingTaxonomyTag;
	material?: PackagingTaxonomyTag;
	recycling?: PackagingTaxonomyTag;
	quantity_per_unit?: string;
	weight_measured?: number;
};

export type AttributeParameters = { type: 'tags'; id: string; name: string; tagtype: string };

export type Attribute = Omit<NonNullable<AttributeGroupV2[number]['attributes']>[number], 'id'> & {
	id: string;
	parameters: AttributeParameters[];
	values: string[];
	description?: string;
};

export type AttributeGroup = Omit<AttributeGroupV2[number], 'attributes' | 'id'> & {
	id: string;
	warning?: string;
	attributes?: Attribute[];
};

export type CurrentUserPermissions = {
	status: 'success' | 'failure';
	result?: { id: string };
	user?: {
		userid: string;
		name: string;
		moderator: 0 | 1;
		admin: 0 | 1;
	};
	errors?: Array<{
		message?: { id: string };
		impact?: { id: string };
	}>;
};

export type KnowledgePanelTableRow = SDKKnowledgePanelTableRow & {
	values: (SDKKnowledgePanelTableRow['values'][number] & { icon_url?: string })[];
};
