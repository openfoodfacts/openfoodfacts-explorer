import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { PricesApi, type PaginatedPriceFullList } from '@openfoodfacts/openfoodfacts-nodejs';

import {
	type Brand,
	type Label,
	getTaxo,
	type Store,
	type Category,
	type Origin,
	type Country,
	createProductsApi
} from '$lib/api';

import { createFolksonomyApi, isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
import { createPricesApi, isConfigured as isPriceConfigured } from '$lib/api/prices';

async function getPricesCoords(api: PricesApi, code: string) {
	// load all prices coordinates
	const prices: PaginatedPriceFullList['items'][number] = [];
	const { data, error } = await api.getPrices({ product_code: code });
	if (error != null) throw new Error('Error fetching first page.');

	const { items, pages } = data;

	prices.push(...items.flat());

	for (let page = 2; page <= pages; page++) {
		const res = await api.getPrices({ product_code: code, page: page });
		if (res.error != null) throw new Error(`Error fetching page ${page}.`);
		prices.push(...res.data.items.flat());
	}

	return prices;
}
export const load: PageLoad = async ({ params, fetch }) => {
	const productsApi = createProductsApi(fetch);
	const folkApi = createFolksonomyApi(fetch);

	const { data: state, error: apiError } = await productsApi.getProductV3(params.barcode, {
		fields: ['all', 'knowledge_panels']
	});

	if (state == null) {
		error(500, { message: 'Error loading product', errors: [apiError] });
	}
	// product not found
	else if (state.status === 'failure') {
		error(404, { message: 'Failure to load product', errors: state?.errors });
	}

	const categories = getTaxo<Category>('categories', fetch);
	const labels = getTaxo<Label>('labels', fetch);
	const stores = getTaxo<Store>('stores', fetch);
	const brands = getTaxo<Brand>('brands', fetch);
	const origins = getTaxo<Origin>('origins', fetch);
	const countries = getTaxo<Country>('countries', fetch);

	const folksonomyTags = isFolksonomyConfigured()
		? folkApi.getProductTags(params.barcode).then((it) => it.data ?? [])
		: Promise.resolve([]);

	const folksonomyKeys = isFolksonomyConfigured()
		? folkApi.getKeys().then((it) => it.data)
		: Promise.resolve([]);

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
