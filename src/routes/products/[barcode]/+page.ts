import type { PageLoad } from './$types';
import { getKeys, getProduct, getProductFolksonomy, getTaxo } from '$lib/api';

export const load = (async ({ params, fetch }) => {
	const state = getProduct(params.barcode, fetch);
	const categories = getTaxo('categories', fetch);
	const labels = getTaxo('labels', fetch);
	const stores = getTaxo('stores', fetch);
	const brands = getTaxo('brands', fetch);

	const tags = getProductFolksonomy(params.barcode, fetch);
	const keys = getKeys(fetch);

	return {
		state,
		tags,
		keys,
		taxo: {
			categories,
			labels,
			stores,
			brands
		}
	};
}) satisfies PageLoad;
