import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { PricesApi } from '@openfoodfacts/openfoodfacts-nodejs';

import { createProductsApi, createRobotoffApi } from '#lib/api.js';
import { PUBLIC_IMAGES_URL } from '$app/env/public';

import { get } from 'svelte/store';
import { getLanguageCode, preferences } from '#lib/settings.js';
import {
	createFolksonomyApi,
	isConfigured as isFolksonomyConfigured
} from '#lib/api/folksonomy.js';
import { createPricesApi, isConfigured as isPriceConfigured } from '#lib/api/prices.js';
import {
	attributesToDefaultPreferences,
	type AttributeGroup
} from '#lib/stores/preferencesStore.js';
import {
	ERR_INVALID_BARCODE,
	ERR_PRODUCT_NOT_FOUND,
	type ProductStateResponse
} from '#lib/api/errorUtils.js';

async function getPricesCoords(api: PricesApi, code: string) {
	// load all prices coordinates
	const { data, error } = await api.getPrices({ product_code: code });
	if (error != null) throw new Error('Error fetching first page.');

	const { items, pages } = data;

	const prices = [...items.flat()];
	for (let page = 2; page <= pages; page++) {
		const res = await api.getPrices({ product_code: code, page: page });
		if (res.error != null) throw new Error(`Error fetching page ${page}.`);
		prices.push(...res.data.items.flat());
	}

	return prices;
}

type LogoDetection = {
	logo_id: number;
	image_url?: string;
	type?: string;
	value?: string;
	confidence?: number;
};

async function getLogos(barcode: string, fetch: typeof window.fetch): Promise<LogoDetection[]> {
	try {
		const response = await createRobotoffApi(fetch).searchLogos({
			barcode,
			annotated: false
		});
		const data = response.data as
			| {
					logos?: Array<{
						id?: number;
						source_image?: string;
						annotation_type?: string;
						annotation_value?: string;
						score?: number;
					}>;
			  }
			| undefined;

		return (
			data?.logos
				?.filter((logo): logo is typeof logo & { id: number } => logo.id != null)
				.map((logo) => ({
					logo_id: logo.id,
					image_url: logo.source_image
						? `${PUBLIC_IMAGES_URL}/images/products${logo.source_image}`
						: undefined,
					type: logo.annotation_type,
					value: logo.annotation_value,
					confidence: logo.score
				})) ?? []
		);
	} catch (err) {
		console.error('Error fetching logo detections:', err);
		return [];
	}
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
		error(400, ERR_INVALID_BARCODE, { errors: cleanErrors });
	}

	if (err.result?.id === 'product_not_found') {
		error(404, ERR_PRODUCT_NOT_FOUND, { errors: cleanErrors });
	}

	error(500, 'Server Error', { errors: cleanErrors });
}

export const load: PageLoad = async ({ params, fetch }) => {
	const productsApi = createProductsApi(fetch);
	const folkApi = createFolksonomyApi(fetch);

	const lc = getLanguageCode(get(preferences).locale);

	const { data: state, error: apiErrorWrapped } = await productsApi.getProductV3(params.barcode, {
		product_type: 'all',
		fields: [
			'all',
			'knowledge_panels',
			`categories_tags_${lc}`,
			`brands_tags_${lc}`,
			`labels_tags_${lc}`,
			`origins_tags_${lc}`,
			`stores_tags_${lc}`,
			`countries_tags_${lc}`
		],
		// @ts-expect-error - This is a temporary workaround until the SDK supports this parameter.
		knowledge_panels_client: 'web',
		lc
	});

	handleProductApiError(apiErrorWrapped);

	if (!state) {
		error(500, 'Unable to connect to Open Food Facts API', { errors: [] });
	}

	if (state.status === 'failure') {
		error(404, 'Failure to load product', { errors: state.errors });
	}

	const folksonomyTags = isFolksonomyConfigured()
		? folkApi.getProductTags(params.barcode).then((it) => it.data ?? [])
		: Promise.resolve([]);

	const folksonomyKeys = isFolksonomyConfigured()
		? folkApi.getKeys().then((it) => it.data)
		: Promise.resolve([]);

	const pricesResponse = isPriceConfigured()
		? getPricesCoords(createPricesApi(fetch), params.barcode)
		: Promise.resolve(null);
	const logosResponse = getLogos(params.barcode, fetch);

	const defaultPreferences = (async () => {
		const { data: attributeGroups } = await productsApi.getAttributeGroups();
		// FIXME: Remove cast when SDK fixes ids type being string | undefined
		const attributeGroupsList = (attributeGroups ?? []) as AttributeGroup[];
		return attributesToDefaultPreferences(attributeGroupsList);
	})();

	return {
		state,
		lc,
		defaultProductPreferences: await defaultPreferences,
		tags: await folksonomyTags,
		keys: await folksonomyKeys,
		prices: await pricesResponse,
		logos: await logosResponse
	};
};
