import { createProductsApi } from '$lib/api';
import { API_HOST } from '$lib/const';
import { fetchRequired } from '$lib/promises';
import type { PageLoad } from './$types';

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

	if (
		typeof data !== 'object' ||
		data === null ||
		!('count' in data) ||
		!Number.isFinite(Number(data.count))
	) {
		throw new Error('Invalid contributors facet response: expected a numeric "count" property');
	}

	return Number(data.count);
}

export const load: PageLoad = async ({ fetch }) => {
	const productCount = await getNumberOfProducts(fetch);
	const contributorCount = await getNumberOfContributors(fetch);

	return {
		productCount,
		contributorCount
	};
};
