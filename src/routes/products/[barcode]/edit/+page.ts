import { getProduct, getTaxo } from '$lib/api';
import type { Category, Origin, Label, Brand, Store, Country } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from '../$types';
import { preferences } from '$lib/settings';
import { get } from 'svelte/store';

export const load = (async ({ fetch, params }) => {
	const user = get(preferences).username;

	if (user == null) {
		error(401, { message: 'User not Authenticated' });
	}
	const [product, categories, labels, brands, stores, origins, countries] = await Promise.all([
		getProduct(params.barcode, fetch),
		getTaxo<Category>('categories', fetch),
		getTaxo<Label>('labels', fetch),
		getTaxo<Brand>('brands', fetch),
		getTaxo<Store>('stores', fetch),
		getTaxo<Origin>('origins', fetch),
		getTaxo<Country>('countries', fetch)
	]);

	if (product.status === 'failure') {
		error(404, {
			message: 'Failure to load product',
			errors: product.errors
		});
	}

	return {
		state: product,
		categories,
		labels,
		brands,
		stores,
		origins,
		countries
	};
}) satisfies PageLoad;
