import { error, redirect } from '@sveltejs/kit';
import { get } from 'svelte/store';

import {
	getTaxo,
	type Category,
	type Origin,
	type Label,
	type Brand,
	type Store,
	type Country,
	type Unit,
	type Allergen,
	createProductsApi
} from '$lib/api';
import { PRODUCT_STATUS } from '$lib/const';
import { userInfo } from '$lib/stores/user';

import type { PageLoad } from './$types';
import { dev } from '$app/environment';
import { preferences } from '$lib/settings';
import { resolve } from '$app/paths';

export const ssr = false;

export const load: PageLoad = async ({ fetch, params, url }) => {
	if (window == null) {
		error(500, 'This page requires a browser environment');
	}

	if (get(userInfo) == null && !dev) {
		redirect(
			302,
			resolve('/loginrequired') + `?redirect=${encodeURIComponent(url.pathname + url.search)}`
		);
	}

	const off = createProductsApi(fetch);

	const productReq = await off.getProductV3(params.barcode, {
		lc: get(preferences).lang,
		cc: get(preferences).country
	});

	const { data: productState, error: productError } = productReq;
	if (productError || !productState) {
		error(500, 'Error loading product');
	}

	if (productState.status === 'failure' && productState.result?.id !== 'product_not_found') {
		error(500, {
			message: 'Failure to load product',
			errors: productState.errors
		});
	}

	// TODO: switch to SDK
	const productType =
		productState.status !== 'failure' ? productState.product.product_type : undefined;

	const [categories, labels, brands, stores, origins, countries, units, allergens] =
		await Promise.all([
			getTaxo<Category>('categories', fetch, productType),
			getTaxo<Label>('labels', fetch, productType),
			getTaxo<Brand>('brands', fetch, productType),
			getTaxo<Store>('stores', fetch, productType),
			getTaxo<Origin>('origins', fetch, productType),
			getTaxo<Country>('countries', fetch, productType),
			getTaxo<Unit>('units', fetch, productType),
			getTaxo<Allergen>('allergens', fetch, productType)
		]);

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
			countries,
			units,
			allergens
		};
	}

	return {
		state: productState,
		categories,
		labels,
		brands,
		stores,
		origins,
		countries,
		units,
		allergens
	};
};
