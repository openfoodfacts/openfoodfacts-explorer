import { createProductsApi, type ProductAttributeForScoringGroup } from '#lib/api/product.js';

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

	const api = createProductsApi(fetch);

	const bulkFetchProducts = async (codes: string[]) => {
		const params = new URLSearchParams({
			code: codes.join(','),
			page_size: String(codes.length),
			fields: ['product_name', 'code', 'attribute_groups', 'image_front_small_url'].join(',')
		});

		const { data, error } = await api.apiv2.search(Object.fromEntries(params.entries()));
		if (!data) {
			throw new Error(`No data returned for bulk product attributes: ${error || 'unknown error'}`);
		}

		return data.products || [];
	};

	// TODO VERIFY: Product opener can limit the number of results returned by the API.
	// Fetch in batches of 100 product codes. We explicitly do this sequentially to avoid
	// overloading the server.
	for (let offset = 0; offset < productCodes.length; offset += 100) {
		const batch = productCodes.slice(offset, offset + 100);

		const products = await bulkFetchProducts(batch);

		for (const product of products || []) {
			if (!product.code) continue;
			// @ts-expect-error - FIXME: deduplicate attribute groups definition
			attributesByCode[product.code] = product.attribute_groups || [];
			if (product.image_front_small_url) imagesByCode[product.code] = product.image_front_small_url;
		}
	}
	return { attributesByCode, imagesByCode };
}
