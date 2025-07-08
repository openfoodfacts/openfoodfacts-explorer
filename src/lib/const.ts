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

export const SORT_OPTIONS = [
	{ label: 'Most scanned products', value: '-unique_scans_n' },
	{ label: 'Products with the best Green-Score', value: 'ecoscore_grade' },
	{ label: 'Products with the best Nutri-Score', value: 'nutriscore_grade' },
	{ label: 'Recently added products', value: '-created_t' },
	{ label: 'Recently modified products', value: '-last_modified_t' }
];

export const NO_MARGIN_ROUTES = ['/discover', '/contribute', '/producers'];
