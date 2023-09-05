import type { PageLoad } from './$types';
import {
	type Brand,
	type Label,
	getKeys,
	getProduct,
	getProductFolksonomy,
	getTaxo,
	type Store,
	type Category
} from '$lib/api';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, fetch }) => {
	const state = await getProduct(params.barcode, fetch);
	if (state.status === 'failure') {
		throw error(404, { message: 'Failure to load product', errors: state.errors });
	}

	const categories = getTaxo<Category>('categories', fetch);
	const labels = getTaxo<Label>('labels', fetch);
	const stores = getTaxo<Store>('stores', fetch);
	const brands = getTaxo<Brand>('brands', fetch);

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
};
