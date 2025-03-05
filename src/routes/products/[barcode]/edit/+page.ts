import { getProduct, getTaxo } from '$lib/api';
import type { Category, Origin, Label, Brand, Store, Country } from '$lib/api';
import { error } from '@sveltejs/kit';
import type { PageLoad } from '../$types';

export const load = (async ({ fetch, params }) => {
	const product = await getProduct(params.barcode, fetch);

	const categories = await getTaxo<Category>('categories', fetch);
	const labels = await getTaxo<Label>('labels', fetch);
	const brands = await getTaxo<Brand>('brands', fetch);
	const stores = await getTaxo<Store>('stores', fetch);
	const origins = await getTaxo<Origin>('origins', fetch);
	const countries = await getTaxo<Country>('countries', fetch);

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
