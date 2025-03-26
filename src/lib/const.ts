export const STATIC_HOST = 'https://static.openfoodfacts.org';
export const API_HOST = import.meta.env.VITE_OFF_BASE_URL || 'https://world.openfoodfacts.org';
export const SEARCH_URL = `${API_HOST}/api/v2/search`;
export const IMAGE_HOST = 'https://images.openfoodfacts.org';
export const PRODUCT_EDIT_URL = `${API_HOST}/product/`;
export const PRODUCT_REPORT_URL = `${API_HOST}/product/`;

export const USER_AGENT = `Open Food Facts Explorer (${import.meta.env.PACKAGE_VERSION})`;

export const KP_ATTRIBUTE_IMG = (img: string) => `${STATIC_HOST}/images/attributes/dist/${img}`;
export const TAXONOMY_URL = (taxo: string) => `${STATIC_HOST}/data/taxonomies/${taxo}.json`;
export const PRODUCT_URL = (barcode: string) => `${API_HOST}/api/v3/product/${barcode}.json`;
export const PRODUCT_IMAGE_URL = (path: string) => `${IMAGE_HOST}/images/products/${path}`;
