import { TAXONOMY_URL, type ProductType } from '$lib/const';
import { wrapFetch } from '$lib/utils';
import type { TaxoNode, Taxonomy } from './types';

// Cache taxonomy promises to prevent redundant fetches across components
const taxoCache = new Map<string, Promise<any>>();

export async function getTaxo<T extends TaxoNode>(
	taxo: string,
	fetch: (url: string, options?: RequestInit) => Promise<Response>,
	productType?: ProductType
): Promise<Taxonomy<T>> {
	const key = `${taxo}-${productType || 'all'}`;

	if (taxoCache.has(key)) {
		return taxoCache.get(key) as Promise<Taxonomy<T>>;
	}

	const fetchPromise = (async () => {
		const res = await wrapFetch(fetch)(TAXONOMY_URL(taxo, productType));
		if (!res.ok) {
			taxoCache.delete(key);
			throw new Error(`Failed to fetch taxonomy ${taxo}: ${res.status} ${res.statusText}`);
		}
		return await res.json();
	})();

	taxoCache.set(key, fetchPromise);
	return fetchPromise;
}
