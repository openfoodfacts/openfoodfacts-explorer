
import type { ProductV3 } from '@openfoodfacts/openfoodfacts-nodejs';
import type { Nutriments } from './nutriments';

// Extends ProductV3 to fix fields the SDK wrongly marks as nullable
export type ProductV3Extended = ProductV3 & {
	code: string;   // barcode
	product_name: string;
	nutriments?: Nutriments;
};

