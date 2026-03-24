import type { AttributeV2 } from '@openfoodfacts/openfoodfacts-nodejs';

export type ProductGroupedAttributes = {
	id: string;
	name: string;
	warning?: string;
	attributes: AttributeV2[];
};
