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

export function toWebsiteFlavor(productType: string): WebsiteFlavor {
	if ((WEBSITE_FLAVORS as readonly string[]).includes(productType)) {
		return productType as WebsiteFlavor;
	}

	return 'food';
}

// Maps the `?landing=` query parameter (used for temporary landing pages) to
// the corresponding website flavor. e.g. `?landing=obf` -> 'beauty'.
const LANDING_PARAM_TO_FLAVOR: Record<string, WebsiteFlavor> = {
	off: 'food',
	obf: 'beauty',
	opff: 'petfood',
	opf: 'product'
};

export function flavorFromLandingParam(param: string | null | undefined): WebsiteFlavor | null {
	if (param == null) return null;
	return LANDING_PARAM_TO_FLAVOR[param] ?? null;
}
