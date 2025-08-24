import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { PricesApi } from '@openfoodfacts/openfoodfacts-nodejs';

import {
	type Brand,
	type Label,
	getTaxo,
	type Store,
	type Category,
	type Origin,
	type Country,
	ProductsApi
} from '$lib/api';

import { createFolksonomyApi, isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
import {
	createPricesApi,
	isConfigured as isPriceConfigured,
	type PriceFull
} from '$lib/api/prices';

async function getPricesCoords(api: PricesApi, code: string) {
	// load all prices coordinates
	const prices: PriceFull[] = [];
	const res = await api.getPrices({ product_code: code });
	if (res.error != null) throw new Error('Error fetching first page.');

	prices.push(...res.data.items.flat());

	const pages = res.data.pages;
	for (let page = 2; page <= pages; page++) {
		const res = await api.getPrices({ product_code: code, page: page });
		if (res.error != null) throw new Error(`Error fetching page ${page}.`);
		prices.push(...res.data.items.flat());
	}

	return prices;
}

export const load: PageLoad = async ({ params, fetch, depends }) => {
	depends(`product:${params.barcode}`);

	const productsApi = new ProductsApi(fetch);
	const folkApi = createFolksonomyApi(fetch);

	const state = await productsApi.getProduct(params.barcode);
	if (state.status === 'failure') {
		error(404, { message: 'Failure to load product', errors: state.errors });
	}

	const categories = getTaxo<Category>('categories', fetch);
	const labels = getTaxo<Label>('labels', fetch);
	const stores = getTaxo<Store>('stores', fetch);
	const brands = getTaxo<Brand>('brands', fetch);
	const origins = getTaxo<Origin>('origins', fetch);
	const countries = getTaxo<Country>('countries', fetch);

	const folksonomyTags = isFolksonomyConfigured() ? folkApi.getProductTags(params.barcode) : [];
	const folksonomyKeys = isFolksonomyConfigured() ? folkApi.getKeys() : [];

	const pricesApi = createPricesApi(fetch);
	const pricesResponse = isPriceConfigured()
		? getPricesCoords(pricesApi, params.barcode)
		: Promise.resolve(null);

	const productAttributes = await productsApi.getProductAttributes(params.barcode);

	return {
		state,
		productAttributes: productAttributes,
		tags: await folksonomyTags,
		keys: await folksonomyKeys,
		taxo: {
			categories,
			labels,
			stores,
			brands,
			countries,
			origins
		},
		prices: await pricesResponse
	};
};
