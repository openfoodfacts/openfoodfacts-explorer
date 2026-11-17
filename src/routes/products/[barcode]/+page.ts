import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

import { createProductsApi } from '#lib/api.js';

import { get } from 'svelte/store';
import { getLanguageCode, preferences } from '#lib/settings.js';
import {
	ERR_INVALID_BARCODE,
	ERR_PRODUCT_NOT_FOUND,
	type ProductStateResponse
} from '#lib/api/errorUtils.js';

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

	return { state, lc };
};
