import { TAXONOMY_URL } from '$lib/const';
import { wrapFetch } from '$lib/utils';
import type { TaxoNode, Taxonomy } from './types';

export async function getTaxo<T extends TaxoNode>(
	taxo: string,
	fetch: (url: string, options?: RequestInit) => Promise<Response>
): Promise<Taxonomy<T>> {
	const res = await wrapFetch(fetch)(TAXONOMY_URL(taxo));
	if (!res.ok) {
		throw new Error(`Failed to fetch taxonomy ${taxo}: ${res.status} ${res.statusText}`);
	}
	return await res.json();
}
