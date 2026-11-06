import { createProductsApi, type ProductAttributeForScoringGroup } from '#lib/api/product.js';

/** Load the fields needed for facet product cards and personalized scoring in one request. */
export async function getBulkProductAttributesAndImages(
	fetch: typeof window.fetch,
	productCodes: string[]
) {
	const attributesByCode: Record<string, ProductAttributeForScoringGroup[]> = {};
	const imagesByCode: Record<string, string> = {};
	if (productCodes.length === 0) return { attributesByCode, imagesByCode };

	const api = createProductsApi(fetch);
	const params = new URLSearchParams({
		code: productCodes.join(','),
		fields: 'product_name,code,attribute_groups,image_front_small_url'
	});
	const { data, error } = await api.apiv2.search(Object.fromEntries(params.entries()));
	if (!data)
		throw new Error(`No data returned for bulk product attributes: ${error || 'unknown error'}`);

	for (const product of data.products || []) {
		if (!product.code) continue;
		// @ts-expect-error - FIXME: deduplicate attribute groups definition
		attributesByCode[product.code] = product.attribute_groups || [];
		if (product.image_front_small_url) imagesByCode[product.code] = product.image_front_small_url;
	}
	return { attributesByCode, imagesByCode };
}
