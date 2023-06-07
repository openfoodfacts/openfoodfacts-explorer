export const STATIC_HOST = 'https://static.openfoodfacts.org';

export const TAXONOMY_URL = (taxo: string) => `${STATIC_HOST}/data/taxonomies/${taxo}.json`;

export const API_HOST = 'https://world.openfoodfacts.org';

export const PRODUCT_URL = (barcode: string) => `${API_HOST}/api/v3/product/${barcode}.json`;
export const SEARCH_URL = `${API_HOST}/api/v2/search`;

export const USER_AGENT = `Open Food Facts Explorer (${import.meta.env.PACKAGE_VERSION})`;

console.debug('User agent', USER_AGENT);
