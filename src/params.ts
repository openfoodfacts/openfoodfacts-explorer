import { defineParams } from '@sveltejs/kit/params';

const matchBarcode = (param: string) => {
	return /^(?:\d{5,8}|\d{12,14})$/.test(param);
};

/**
 * Whether a facet path ends with a facet to list, such as "categories"
 * in /facets/brands/ferrero/categories. Paths of facet/value pairs have an even length.
 */
export function isDrilldownPath(param: string): boolean {
	const parts = param.split('/');
	return parts.length % 2 === 1 && !parts.includes('');
}

export const params = defineParams({
	barcode: (param) => (matchBarcode(param) ? param : undefined),
	drilldown: (param) => (isDrilldownPath(param) ? param : undefined)
});
