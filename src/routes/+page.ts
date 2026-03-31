import { wrapFetchWithCredentials } from '$lib/api/utils';
import { API_HOST } from '$lib/const';
import type { PageLoad } from './$types';

const FETCH_TIMEOUT = 10000; // 10 seconds timeout

async function withTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number = FETCH_TIMEOUT
): Promise<T | null> {
	return Promise.race([
		promise,
		new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
	]);
}

async function getNumberOfProducts(fetch: typeof globalThis.fetch): Promise<number> {
	try {
		const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(API_HOST));
		const res = await withTimeout(wrappedFetch(`${url}.json`), FETCH_TIMEOUT);
		if (res === null) {
			console.warn('Product count fetch timeout');
			return 0;
		}
		if (!res.ok) {
			console.error(`Failed to fetch product count: ${res.status} ${res.statusText}`);
			return 0;
		}
		const data = await res.json();
		return data?.count || 0;
	} catch (error) {
		console.error('Error fetching product count:', error);
		return 0;
	}
}

async function getNumberOfContributors(fetch: typeof globalThis.fetch): Promise<number> {
	try {
		const { fetch: wrappedFetch, url } = wrapFetchWithCredentials(fetch, new URL(API_HOST));
		const res = await withTimeout(wrappedFetch(`${url}facets/contributors.json`), FETCH_TIMEOUT);
		if (res === null) {
			console.warn('Contributor count fetch timeout');
			return 0;
		}
		if (!res.ok) {
			console.error(`Failed to fetch contributor count: ${res.status} ${res.statusText}`);
			return 0;
		}
		const data = await res.json();
		return data?.count || 0;
	} catch (error) {
		console.error('Error fetching contributor count:', error);
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
