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
