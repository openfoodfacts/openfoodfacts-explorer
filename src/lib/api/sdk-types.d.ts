/**
 * Type augmentations and extensions for @openfoodfacts/openfoodfacts-nodejs SDK
 * These types extend and fix issues in the SDK's type definitions
 */

import type { ProductV3 } from '@openfoodfacts/openfoodfacts-nodejs';
import type { Nutriments } from './nutriments';

/**
 * Extended ProductV3 type with properly typed fields
 * Fixes SDK type issues where certain fields are incorrectly typed as nullable
 */
export type ProductV3Extended = ProductV3 & {
	/** Product code/barcode - always present in successful responses */
	code: string;
	/** Product name - always present */
	product_name: string;
	/** Nutriments data with proper type definition */
	nutriments?: Nutriments;
};

