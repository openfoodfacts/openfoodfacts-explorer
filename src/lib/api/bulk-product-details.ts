import {
	createProductsApi,
	REDUCED_FIELDS,
	type ProductAttributeForScoringGroup,
	type ProductReduced
} from '#lib/api/product.js';

async function fetchProductsInBatches(
	fetch: typeof window.fetch,
	productCodes: string[],
	fields: readonly string[]
) {
	const api = createProductsApi(fetch);
	const products = [];

	// TODO VERIFY: Product opener can limit the number of results returned by the API.
	// Fetch in batches of 100 product codes. We explicitly do this sequentially to avoid
	// overloading the server.
	for (let offset = 0; offset < productCodes.length; offset += 100) {
		const codes = productCodes.slice(offset, offset + 100);
		const params = new URLSearchParams({
			code: codes.join(','),
			page_size: String(codes.length),
			fields: fields.join(',')
		});

		const { data, error } = await api.apiv2.search(Object.fromEntries(params.entries()));
		if (!data) {
			throw new Error(`No data returned for bulk product attributes: ${error || 'unknown error'}`);
		}

		products.push(...(data.products || []));
	}
	return products;
}

/**
 * Load the fields needed for search result cards and personalized scoring in one request.
 *
 * @returns an object containing two maps: cardsByCode and attributesByCode.
 */
export async function getBulkProductCardsAndAttributes(
	fetch: typeof window.fetch,
	productCodes: string[]
) {
	const cardsByCode: Record<string, ProductReduced> = {};
	const attributesByCode: Record<string, ProductAttributeForScoringGroup[]> = {};
	if (productCodes.length === 0) return { cardsByCode, attributesByCode };

	const products = await fetchProductsInBatches(fetch, productCodes, [
		...REDUCED_FIELDS,
		'attribute_groups'
	]);
	for (const product of products) {
		if (!product.code) continue;
		cardsByCode[product.code] = product as unknown as ProductReduced;
		// @ts-expect-error - FIXME: deduplicate attribute groups definition
		attributesByCode[product.code] = product.attribute_groups || [];
	}
	return { cardsByCode, attributesByCode };
}

/**
 * Load the fields needed for facet product cards and personalized scoring.
 *
 * @returns an object containing two maps: attributesByCode and imagesByCode.
 * attributesByCode maps product codes to their attribute groups,
 * imagesByCode maps product codes to their small front image URLs.
 */
export async function getBulkProductAttributesAndImages(
	fetch: typeof window.fetch,
	productCodes: string[]
) {
	const attributesByCode: Record<string, ProductAttributeForScoringGroup[]> = {};
	const imagesByCode: Record<string, string> = {};
	if (productCodes.length === 0) return { attributesByCode, imagesByCode };

	const products = await fetchProductsInBatches(fetch, productCodes, [
		'product_name',
		'code',
		'attribute_groups',
		'image_front_small_url'
	]);
	for (const product of products) {
		if (!product.code) continue;
		// @ts-expect-error - FIXME: deduplicate attribute groups definition
		attributesByCode[product.code] = product.attribute_groups || [];
		if (product.image_front_small_url) imagesByCode[product.code] = product.image_front_small_url;
	}
	return { attributesByCode, imagesByCode };
}
