import type { AttributeV2 } from '@openfoodfacts/openfoodfacts-nodejs';

export type ProductGroupedAttributes = {
	id: string;
	name: string;
	warning?: string;
	// FIXME: Remove panel_id once the SDK type includes it
	attributes: (AttributeV2 & { panel_id?: string })[];
};
