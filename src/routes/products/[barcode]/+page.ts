import type { PageLoad } from './$types';
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
import { error } from '@sveltejs/kit';
import { FolksonomyApi } from '$lib/api/folksonomy';
import { PricesApi, isConfigured as isPricesConfigured } from '$lib/api/prices';

export const ssr = false;

import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';

export const load: PageLoad = async ({ params, fetch }) => {
	const productsApi = new ProductsApi(fetch);
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

	const off = new OpenFoodFacts(fetch);

	const folkApi = new FolksonomyApi(fetch);
	const folksonomyTags = folkApi.getProduct(params.barcode);
	const folksonomyKeys = folkApi.getKeys();

	const pricesApi = new PricesApi(fetch);
	let pricesResponse = null;
	if (isPricesConfigured()) {
		pricesResponse = pricesApi.getPrices({ product_code: params.barcode });
	}

	// TODO: parseInt should be removed. Barcodes are strings
	const questions = off.robotoff.questionsByProductCode(parseInt(params.barcode)).then(
		(res) => {
			if (res?.status === 'found') {
				return res.questions ?? [];
			} else {
				return [];
			}
		},
		(e) => {
			console.error(e);
			return [];
		}
	);

	return {
		state,
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
		prices: await pricesResponse,
		questions
	};
};
