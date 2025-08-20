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
import { userInfo } from '$lib/stores/pkceLoginStore';
import { PRODUCT_STATUS } from '$lib/const';

import type { PageLoad } from './$types';
import { dev } from '$app/environment';
import { preferences } from '$lib/settings';

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
					url: '/login'
				}
			]
		});
	}

	const off = createProductsApi(fetch);

	const [productState, categories, labels, brands, stores, origins, countries] = await Promise.all([
		off.getProductV3(params.barcode, {
			// @ts-expect-error - TODO: To be fixed in the SDK
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

	if (productState == null) {
		error(404, 'Product not found');
	}

	// @ts-expect-error - https://github.com/openfoodfacts/openfoodfacts-server/issues/12273
	console.debug(`Product state for barcode ${params.barcode}:`, productState.status);

	// @ts-expect-error - https://github.com/openfoodfacts/openfoodfacts-server/issues/12273
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
	}
	// @ts-expect-error - https://github.com/openfoodfacts/openfoodfacts-server/issues/12273
	else if (productState.status === 'failure') {
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
