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

export function toWebsiteFlavor(productType: string | null | undefined): WebsiteFlavor {
	if (productType && productType in WEBSITE_FLAVOR_METADATA) {
		return productType as WebsiteFlavor;
	}

	return 'food';
}
