import { createProductsApi } from '$lib/api';
import { API_HOST } from '$lib/const';
import { fetchRequired } from '$lib/promises';
import type { PageLoad } from './$types';
import { createRobotoffApi, getProductReducedForCard, getBulkProductAttributes } from '$lib/api';
import { deduplicate } from '$lib/utils';

const INSIGHT_COUNT = 12;

async function getNumberOfProducts(fetch: typeof window.fetch): Promise<number> {
	// The API doesn't provide a dedicated endpoint for getting the total number of products,
	// so we fetch the first page of products and read the "count" property from the response.

	const data = await fetchRequired(fetch, new URL('.json', API_HOST));
	if (
		typeof data !== 'object' ||
		data === null ||
		!('count' in data) ||
		typeof data.count !== 'number'
	) {
		throw new Error('Invalid response format: expected an object with a numeric "count" property');
	}
	return data.count;
}

async function getNumberOfContributors(fetch: typeof window.fetch): Promise<number> {
	const api = createProductsApi(fetch);
	const data = await api.getFacet('contributors');
	return data.count;
}

async function getProductsWithAttributes(fetch: typeof window.fetch) {
	const roffApi = createRobotoffApi(fetch);
	const { data: robotoffData } = await roffApi.insights({ count: INSIGHT_COUNT });
	const insights = robotoffData?.insights ?? [];

	const productsPromises = insights.map((question) =>
		getProductReducedForCard(fetch, question.barcode.toString())
	);
	const productStates = await Promise.all(productsPromises);

	const products = deduplicate(
		productStates.map((res) => res.data).filter((res) => res?.status !== 'failure' && res != null),
		(it) => it.product.code
	);

	const productCodes = products.map((state) => state.product.code);
	const attributes = await getBulkProductAttributes(fetch, productCodes);

	return { products, attributes };
}

export const load: PageLoad = async ({ fetch }) => {
	const productCount = getNumberOfProducts(fetch);
	const contributorCount = getNumberOfContributors(fetch);

	const productsWithAttributes = getProductsWithAttributes(fetch);
	return {
		productCount,
		contributorCount,
		products: productsWithAttributes.then((res) => res.products),
		attributesByCode: productsWithAttributes.then((res) => res.attributes)
	};
};
