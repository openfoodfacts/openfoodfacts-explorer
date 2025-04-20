import { getProduct, getTaxo } from '$lib/api';
import type { Category, Origin, Label, Brand, Store, Country } from '$lib/api';
import type { PageLoad } from '../$types';

export const load = (async ({ fetch, params }) => {
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
		return {
			state: {
				status: 'empty',
				product: null,
				errors: product.errors
			},
			categories,
			labels,
			brands,
			stores,
			origins,
			countries
		};
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
