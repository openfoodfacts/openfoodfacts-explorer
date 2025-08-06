import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

import {
	getProduct,
	getTaxo,
	type Category,
	type Origin,
	type Label,
	type Brand,
	type Store,
	type Country
} from '$lib/api';
import { userInfo } from '$lib/stores/pkceLoginStore';
import { PRODUCT_STATUS } from '$lib/const';

import type { PageLoad } from './$types';
import { dev } from '$app/environment';

export const ssr = false;

export const load = (async ({ fetch, params }) => {
	if (window == null) {
		error(500, 'This page requires a browser environment');
	}

	if (get(userInfo) == null && !dev) {
		// If the user is not logged in, redirect to the login page
		// We allow an exception for development mode
		error(401, 'You must be logged in to view this page');
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

	if (product.status === 'failure' && product.result.id === 'product_not_found') {
		return {
			state: {
				status: PRODUCT_STATUS.EMPTY,
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
	} else if (product.status === 'failure') {
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
