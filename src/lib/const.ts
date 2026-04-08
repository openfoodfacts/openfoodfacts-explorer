import { resolve } from '$app/paths';
import { env as publicEnv } from '$env/dynamic/public';
import { toWebsiteFlavor, WEBSITE_FLAVOR_METADATA } from '$lib/flavor';

const {
	PUBLIC_ROBOTOFF_URL,
	PUBLIC_IMAGES_URL,
	PUBLIC_NUTRIPATROL_URL,
	PUBLIC_AUTH_BASE_URL,
	PUBLIC_AUTH_PKCE_ID,
	PUBLIC_KEYCLOAK_REALM,
	PUBLIC_OPEN_PRICES_BASE_URL
} = publicEnv;

export {
	PUBLIC_ROBOTOFF_URL as ROBOTOFF_URL,
	PUBLIC_IMAGES_URL as IMAGE_HOST,
	PUBLIC_NUTRIPATROL_URL as NUTRIPATROL_URL
};

export const STATIC_HOST = 'https://static.openfoodfacts.org';
export const API_HOST = publicEnv.PUBLIC_OFF_BASE_URL || 'https://world.openfoodfacts.org';
export const SEARCH_URL = `${API_HOST}/api/v2/search`;
export const PRODUCT_EDIT_URL = `${API_HOST}/product/`;
export const CURRENT_USER_PERMISSIONS_URL = `${API_HOST}/api/v3/current-user/permissions`;

export const TRACEABILITY_CODES_URL =
	'https://wiki.openfoodfacts.org/Food_Traceability_Codes/EU_Food_establishments';

export const USER_AGENT = `Open Food Facts Explorer (${import.meta.env.PACKAGE_VERSION})`;

export const KP_ATTRIBUTE_IMG = (img: string) => `${STATIC_HOST}/images/attributes/dist/${img}`;
export const PRODUCT_URL = (barcode: string) => `${API_HOST}/api/v3/product/${barcode}.json`;

export const PRODUCT_WEBSITE_URL = (barcode: string, productType?: string) => {
	const flavor = toWebsiteFlavor(productType ?? '');
	return `${WEBSITE_FLAVOR_METADATA[flavor].apiBaseUrl}/product/${encodeURIComponent(barcode)}`;
};

export const PRODUCT_WEBSITE_NAME = (productType?: string) => {
	const flavor = toWebsiteFlavor(productType ?? '');
	return WEBSITE_FLAVOR_METADATA[flavor].displayName;
};
export const PRODUCT_IMAGE_URL = (path: string) => `${PUBLIC_IMAGES_URL}/images/products/${path}`;
export const PRODUCT_STATUS = {
	EMPTY: 'empty'
};

export const PRODUCT_TYPES = ['food', 'beauty', 'petfood', 'product'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

// TODO: Make this configurable via env vars
export const BACKEND_DOMAINS: Record<ProductType, string> = {
	food: 'openfoodfacts.org',
	beauty: 'openbeautyfacts.org',
	petfood: 'openpetfoodfacts.org',
	product: 'openproductsfacts.org'
};

const STATIC_HOSTS: Record<ProductType, string> = {
	food: `https://static.${BACKEND_DOMAINS.food}`,
	beauty: `https://static.${BACKEND_DOMAINS.beauty}`,
	petfood: `https://static.${BACKEND_DOMAINS.petfood}`,
	product: `https://static.${BACKEND_DOMAINS.product}`
};

// TODO: switch to SDK
export const TAXONOMY_URL = (taxo: string, productType?: ProductType) =>
	`${STATIC_HOSTS[productType ?? 'food']}/data/taxonomies/${taxo}.json`;

export const OAUTH_IDP_BASE_URL = PUBLIC_AUTH_BASE_URL;
export const OAUTH_CLIENT_ID = PUBLIC_AUTH_PKCE_ID;
export const OAUTH_REDIRECT_URI = (url: URL) => url.origin + resolve('/oauth/login/callback');

export const KEYCLOAK_REALM = PUBLIC_KEYCLOAK_REALM;
export const KEYCLOAK_URL = `${OAUTH_IDP_BASE_URL}/realms/${KEYCLOAK_REALM}`;
export const KEYCLOAK_ACCOUNT_URL = `${KEYCLOAK_URL}/account/#/`;

export const SORT_OPTIONS = [
	{ label: 'Most scanned products', value: '-unique_scans_n' },
	{ label: 'Products with the best Green-Score', value: 'ecoscore_grade' },
	{ label: 'Products with the best Nutri-Score', value: 'nutriscore_grade' },
	{ label: 'Recently added products', value: '-created_t' },
	{ label: 'Recently modified products', value: '-last_modified_t' }
];

export const OPEN_PRICES_BASE_URL =
	PUBLIC_OPEN_PRICES_BASE_URL || 'https://prices.openfoodfacts.org';
export const OPEN_PRICES_PRODUCT_URL = (barcode: string) =>
	`${OPEN_PRICES_BASE_URL}/product/${encodeURIComponent(barcode)}`;
export const OPEN_PRICES_PRODUCTS_URL = (barcode: string) =>
	`${OPEN_PRICES_BASE_URL}/products/${encodeURIComponent(barcode)}`;

export const MATOMO_SITE_ID = 17;
export const MATOMO_HOST = 'https://analytics.openfoodfacts.org';

export const PRODUCT_REPORT_URL = (code: string, productType?: string) => {
	const flavor = toWebsiteFlavor(productType ?? '');
	const params = new URLSearchParams({
		barcode: code,
		source: 'web',
		flavor: WEBSITE_FLAVOR_METADATA[flavor].reportFlavor
	});
	return `${PUBLIC_NUTRIPATROL_URL}/flag/product/?${params.toString()}`;
};

export const IMAGE_REPORT_URL = (
	barcode: string,
	image_id: number,
	flavor: 'off' = 'off',
	source: 'web' = 'web'
) => {
	const params = new URLSearchParams({
		barcode,
		image_id: image_id.toString(),
		source,
		flavor
	});
	return `${PUBLIC_NUTRIPATROL_URL}/flag/image/?${params.toString()}`;
};
