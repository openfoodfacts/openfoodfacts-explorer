import type { ProductState } from '$lib/product';
import { preferences } from '$lib/settings';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import { PRODUCT_URL, TAXONOMY_URL } from '$lib/const';
import { getProduct, getTaxo } from '$lib/api';

export const load = (async ({ params, fetch }) => {
	const state = getProduct(params.barcode, fetch);
	const categories = getTaxo('categories', fetch);
	const labels = getTaxo('labels', fetch);
	const stores = getTaxo('stores', fetch);
	const brands = getTaxo('brands', fetch);

	return {
		state,
		taxo: {
			categories,
			labels,
			stores,
			brands
		}
	};
}) satisfies PageLoad;
