import { wrapFetchWithCredentials } from './api/utils';

/**
 * Fetch data from the given URL and return it as JSON.
 * Throws an error if the response is not OK or if the response format is not JSON.
 */
export async function fetchRequired(fetch: typeof window.fetch, url: URL): Promise<unknown> {
	const { fetch: wrappedFetch, url: strippedUrl } = wrapFetchWithCredentials(fetch, url);
	const res = await wrappedFetch(strippedUrl);
	if (!res.ok) {
		throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
	}
	const data = await res.json();
	return data;
}
