import { TAXONOMY_URL } from '$lib/const';
import { wrapFetch } from '$lib/utils';
import type { TaxoNode, Taxonomy } from './types';

export async function getTaxo<T extends TaxoNode>(
	taxo: string,
	fetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<Taxonomy<T>> {
	const url = TAXONOMY_URL(taxo);
	const res = await wrapFetch(fetch)(url);
	if (!res.ok) {
		const statusText = res.statusText || 'No status text available';
		throw new Error(`Failed to fetch taxonomy "${taxo}" from ${url}: ${res.status} ${statusText}`);
	}
	return await res.json();
}
