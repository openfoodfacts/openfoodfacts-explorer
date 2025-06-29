import { dev } from '$app/environment';

export const STATIC_HOST = 'https://static.openfoodfacts.org';
export const API_HOST = import.meta.env.VITE_OFF_BASE_URL || 'https://world.openfoodfacts.org';
export const SEARCH_URL = `${API_HOST}/api/v2/search`;
export const IMAGE_HOST = 'https://images.openfoodfacts.org';
export const PRODUCT_EDIT_URL = `${API_HOST}/product/`;
export const PRODUCT_REPORT_URL = `${API_HOST}/product/`;

export const TRACEABILITY_CODES_URL =
	'https://wiki.openfoodfacts.org/Food_Traceability_Codes/EU_Food_establishments';

export const USER_AGENT = `Open Food Facts Explorer (${import.meta.env.PACKAGE_VERSION})`;

export const KP_ATTRIBUTE_IMG = (img: string) => `${STATIC_HOST}/images/attributes/dist/${img}`;
export const TAXONOMY_URL = (taxo: string) => `${STATIC_HOST}/data/taxonomies/${taxo}.json`;
export const PRODUCT_URL = (barcode: string) => `${API_HOST}/api/v3/product/${barcode}.json`;
export const PRODUCT_IMAGE_URL = (path: string) => `${IMAGE_HOST}/images/products/${path}`;
export const PRODUCT_STATUS = {
	EMPTY: 'empty'
};

// Auth/PKCE constants (hardcoded, not from env)
export const AUTH_BASE_URL_PROD = 'https://auth.openfoodfacts.org';
export const AUTH_BASE_URL_DEV = 'http://auth.openfoodfacts.localhost:5600';
export const AUTH_PKCE_ID_DEV = 'test_public_client';
export const AUTH_PKCE_ID_PROD = 'OFF_EXP_PROD';
export const OFF_EXP_BASE_URL_PROD = 'https://openfoodfacts-explorer.vercel.app';
export const OFF_EXP_BASE_URL_DEV = 'http://localhost:5173';

export const AUTH_BASE_URL = dev ? AUTH_BASE_URL_DEV : AUTH_BASE_URL_PROD;
export const AUTH_PKCE_ID = dev ? AUTH_PKCE_ID_DEV : AUTH_PKCE_ID_PROD;
export const OFF_EXP_BASE_URL = dev ? OFF_EXP_BASE_URL_DEV : OFF_EXP_BASE_URL_PROD;
