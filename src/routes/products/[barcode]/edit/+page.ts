import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

import {
	getTaxo,
	type Category,
	type Origin,
	type Label,
	type Brand,
	type Store,
	type Country,
	createProductsApi
} from '$lib/api';
import { userInfo } from '$lib/stores/user';
import { PRODUCT_STATUS } from '$lib/const';

import type { PageLoad } from './$types';
import { dev } from '$app/environment';
import { preferences } from '$lib/settings';
import { resolve } from '$app/paths';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params }) => {
	if (window == null) {
		error(500, 'This page requires a browser environment');
	}

	if (get(userInfo) == null && !dev) {
		// If the user is not logged in, redirect to the login page
		// We allow an exception for development mode
		error(401, {
			message: 'You must be logged in to view this page',
			actions: [
				{
					label: 'Login',
					url: resolve('/oauth/login')
				}
			]
		});
	}

	const off = createProductsApi(fetch);

	const [productReq, categories, labels, brands, stores, origins, countries] = await Promise.all([
		off.getProductV3(params.barcode, {
			lc: get(preferences).lang,
			cc: get(preferences).country
		}),
		getTaxo<Category>('categories', fetch),
		getTaxo<Label>('labels', fetch),
		getTaxo<Brand>('brands', fetch),
		getTaxo<Store>('stores', fetch),
		getTaxo<Origin>('origins', fetch),
		getTaxo<Country>('countries', fetch)
	]);

	const { data: productState, error: productError } = productReq;
	if (productError || !productState) {
		error(500, 'Error loading product');
	}

	console.debug(`Product state for barcode ${params.barcode}:`, productState.status);

	if (productState.status === 'failure' && productState.result?.id === 'product_not_found') {
		return {
			state: {
				status: PRODUCT_STATUS.EMPTY,
				product: null,
				errors: productState.errors
			},
			categories,
			labels,
			brands,
			stores,
			origins,
			countries
		};
	} else if (productState.status === 'failure') {
		error(404, {
			message: 'Failure to load product',
			errors: productState.errors
		});
	}

	return {
		state: productState,
		categories,
		labels,
		brands,
		stores,
		origins,
		countries
	};
};
