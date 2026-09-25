import type {
	KnowledgePanelTableRow as SDKKnowledgePanelTableRow,
	AttributeGroupV2
} from '@openfoodfacts/openfoodfacts-nodejs';

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

export type KnowledgePanelTableRow = SDKKnowledgePanelTableRow & {
	values: (SDKKnowledgePanelTableRow['values'][number] & { icon_url?: string })[];
};
