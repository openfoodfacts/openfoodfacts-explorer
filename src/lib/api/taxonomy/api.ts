import { TAXONOMY_URL, type ProductType } from '$lib/const';
import { wrapFetch } from '$lib/utils';
import type { TaxoNode, Taxonomy } from './types';

export async function getTaxo<T extends TaxoNode>(
	taxo: string,
	fetch: (url: string, options?: RequestInit) => Promise<Response>,
	productType?: ProductType
): Promise<Taxonomy<T>> {
	const res = await wrapFetch(fetch)(TAXONOMY_URL(taxo, productType));
	return await res.json();
}
