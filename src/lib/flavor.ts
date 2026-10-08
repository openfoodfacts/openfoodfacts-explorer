export const WEBSITE_FLAVORS = ['food', 'beauty', 'petfood', 'product'] as const;
export type WebsiteFlavor = (typeof WEBSITE_FLAVORS)[number];

export type WebsiteFlavorMetadata = {
	apiBaseUrl: string;
	displayName: string;
	reportFlavor: 'off' | 'obf' | 'opff' | 'opf';
};

export const WEBSITE_FLAVOR_METADATA: Record<WebsiteFlavor, WebsiteFlavorMetadata> = {
	food: {
		apiBaseUrl: 'https://world.openfoodfacts.org',
		displayName: 'Open Food Facts',
		reportFlavor: 'off'
	},
	beauty: {
		apiBaseUrl: 'https://world.openbeautyfacts.org',
		displayName: 'Open Beauty Facts',
		reportFlavor: 'obf'
	},
	petfood: {
		apiBaseUrl: 'https://world.openpetfoodfacts.org',
		displayName: 'Open Pet Food Facts',
		reportFlavor: 'opff'
	},
	product: {
		apiBaseUrl: 'https://world.openproductsfacts.org',
		displayName: 'Open Products Facts',
		reportFlavor: 'opf'
	}
};

const WEBSITE_FLAVOR_ALIASES: Record<string, WebsiteFlavor> = {
	food: 'food',
	off: 'food',
	beauty: 'beauty',
	obf: 'beauty',
	petfood: 'petfood',
	opff: 'petfood',
	product: 'product',
	opf: 'product'
};

export function toWebsiteFlavor(value: string): WebsiteFlavor {
	return WEBSITE_FLAVOR_ALIASES[value.trim().toLowerCase()] ?? 'food';
}

export function getWebsiteFlavorFromParam(flavorParam: string | null): WebsiteFlavor | undefined {
	if (flavorParam == null || flavorParam.trim() === '') return undefined;

	const flavor = WEBSITE_FLAVOR_ALIASES[flavorParam.trim().toLowerCase()];
	return flavor;
}

export function isCosmeticProduct(productType?: string | null): boolean {
	if (productType == null || productType.trim() === '') return false;
	const normalized = productType.trim().toLowerCase();
	return (
		normalized === 'beauty' ||
		normalized === 'obf' ||
		normalized === 'cosmetic' ||
		normalized === 'cosmetics'
	);
}

/**
 * Updates a product's type and adjusts the `no_nutrition_data` flag accordingly.
 * - When switching to a cosmetic type, nutrition is disabled (no_nutrition_data = true).
 * - When switching from a cosmetic type to a non-cosmetic type, nutrition is re-enabled (no_nutrition_data = false).
 * - When switching between non-cosmetic types, existing no_nutrition_data value is preserved.
 */
export function updateProductType<
	T extends { product_type?: string | null; no_nutrition_data?: boolean }
>(product: T, newType: string): T & { product_type: string; no_nutrition_data?: boolean } {
	const wasCosmetic = isCosmeticProduct(product.product_type);
	const isNowCosmetic = isCosmeticProduct(newType);

	if (isNowCosmetic) {
		return {
			...product,
			product_type: newType,
			no_nutrition_data: true
		};
	}

	if (wasCosmetic && !isNowCosmetic) {
		return {
			...product,
			product_type: newType,
			no_nutrition_data: false
		};
	}

	return {
		...product,
		product_type: newType
	};
}
