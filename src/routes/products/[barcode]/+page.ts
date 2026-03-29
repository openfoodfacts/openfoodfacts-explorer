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
	createProductsApi
} from '$lib/api';

import { createFolksonomyApi, isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
import { createPricesApi, isConfigured as isPriceConfigured } from '$lib/api/prices';
import { attributesToDefaultPreferences, type AttributeGroup } from '$lib/stores/preferencesStore';
import {
	ERR_INVALID_BARCODE,
	ERR_PRODUCT_NOT_FOUND,
	type ProductStateResponse
} from '$lib/api/errorUtils';

async function getPricesCoords(api: PricesApi, code: string) {
	// load all prices coordinates
	const { data, error } = await api.getPrices({ product_code: code });
	if (error != null) throw new Error('Error fetching first page.');

	const { items, pages } = data;

	const prices = [...items.flat()];
	const pagePromises = [];
	for (let page = 2; page <= pages; page++) {
		pagePromises.push(api.getPrices({ product_code: code, page: page }));
	}

	const results = await Promise.all(pagePromises);
	for (let i = 0; i < results.length; i++) {
		const res = results[i];
		if (res.error != null) throw new Error(`Error fetching page ${i + 2}.`);
		prices.push(...res.data.items.flat());
	}

	return prices;
}

function handleProductApiError(apiErrorWrapped: ProductStateResponse | null | undefined) {
	if (!apiErrorWrapped) return;

	const err = apiErrorWrapped as ProductStateResponse;
	const isInvalidFormat = err.errors?.some((e) => e.message?.id === 'invalid_code');
	// FIXME: This is a workaround until the SDK or API returns cleaner data.
	const cleanErrors = err.errors?.map((e) => ({
		...e,
		field: e.field ? { ...e.field, value: e.field.value ?? undefined } : undefined
	}));

	if (isInvalidFormat) {
		error(400, {
			message: ERR_INVALID_BARCODE,
			errors: cleanErrors
		});
	}

	if (err.result?.id === 'product_not_found') {
		error(404, {
			message: ERR_PRODUCT_NOT_FOUND,
			errors: cleanErrors
		});
	}

	error(500, {
		message: 'Server Error',
		errors: cleanErrors
	});
}

export const load: PageLoad = async ({ params, fetch }) => {
	const productsApi = createProductsApi(fetch);
	const folkApi = createFolksonomyApi(fetch);

	const { data: state, error: apiErrorWrapped } = await productsApi.getProductV3(params.barcode, {
		product_type: 'all',
		fields: ['all', 'knowledge_panels'],
		// @ts-expect-error - This is a temporary workaround until the SDK supports this parameter.
		knowledge_panels_client: 'web'
	});

	handleProductApiError(apiErrorWrapped);

	if (!state) {
		error(500, {
			message: 'Unable to connect to Open Food Facts API',
			errors: []
		});
	}

	if (state.status === 'failure') {
		error(404, {
			message: 'Failure to load product',
			errors: state.errors
		});
	}

	// TODO: switch to SDK
	const productType = state.product.product_type;

	const categories = getTaxo<Category>('categories', fetch, productType);
	const labels = getTaxo<Label>('labels', fetch, productType);
	const stores = getTaxo<Store>('stores', fetch, productType);
	const brands = getTaxo<Brand>('brands', fetch, productType);
	const origins = getTaxo<Origin>('origins', fetch, productType);
	const countries = getTaxo<Country>('countries', fetch, productType);

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

	const defaultPreferences = (async () => {
		const { data: attributeGroups } = await productsApi.getAttributeGroups();
		// FIXME: Remove cast when SDK fixes ids type being string | undefined
		const attributeGroupsList = (attributeGroups ?? []) as AttributeGroup[];
		return attributesToDefaultPreferences(attributeGroupsList);
	})();

	const [tags, keys, prices, defaultProductPreferences] = await Promise.all([
		folksonomyTags,
		folksonomyKeys,
		pricesResponse,
		defaultPreferences
	]);

	return {
		state,
		defaultProductPreferences,
		tags,
		keys,
		taxo: {
			categories,
			labels,
			stores,
			brands,
			countries,
			origins
		},
		prices
	};
};
