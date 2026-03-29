import { wrapFetchWithCredentials } from '$lib/api/utils';
import { API_HOST } from '$lib/const';
import type { PageLoad } from './$types';

async function getNumberOfProducts(
	fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>
): Promise<number> {
	try {
		const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(API_HOST));
		const res = await wrappedFetch(`${url}.json`);
		if (!res.ok) {
			console.warn(`Failed to fetch product count: ${res.status} ${res.statusText}`);
			return 0;
		}
		const data = await res.json();
		return data?.count || 0;
	} catch (error) {
		console.error(`Error fetching product count:`, error);
		return 0;
	}
}

async function getNumberOfContributors(
	fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>
): Promise<number> {
	try {
		const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(API_HOST));
		const res = await wrappedFetch(`${url}facets/contributors.json`);
		if (!res.ok) {
			console.warn(`Failed to fetch contributor count: ${res.status} ${res.statusText}`);
			return 0;
		}
		const data = await res.json();
		return data?.count || 0;
	} catch (error) {
		console.error(`Error fetching contributor count:`, error);
		return 0;
	}
}

export const load: PageLoad = async ({ fetch }) => {
	const productCount = getNumberOfProducts(fetch);
	const contributorCount = getNumberOfContributors(fetch);
	return {
		productCount: await productCount,
		contributorCount: await contributorCount
	};
};
