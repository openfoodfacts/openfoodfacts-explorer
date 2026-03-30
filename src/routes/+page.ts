import { wrapFetchWithCredentials } from '$lib/api/utils';
import { API_HOST } from '$lib/const';
import type { PageLoad } from './$types';

async function getNumberOfProducts(
	fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>
): Promise<number> {
	const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(API_HOST));
	const res = await wrappedFetch(`${url}.json`);
	if (!res.ok) {
		throw new Error(`Failed to fetch product count: ${res.status} ${res.statusText}`);
	}
	const data = await res.json();
	return data?.count || 0;
}

async function getNumberOfContributors(
	fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>
): Promise<number> {
	const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(API_HOST));
	const res = await wrappedFetch(`${url}facets/contributors.json`);
	if (!res.ok) {
		throw new Error(`Failed to fetch contributor count: ${res.status} ${res.statusText}`);
	}
	const data = await res.json();
	return data?.count || 0;
}

export const load: PageLoad = async ({ fetch }) => {
	return {
		productCount: getNumberOfProducts(fetch),
		contributorCount: getNumberOfContributors(fetch)
	};
};
