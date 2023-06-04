import { TAXONOMY_URL } from '$lib/const';
import type { TaxoNode, Taxonomy } from './types';

export async function getTaxo<T extends TaxoNode>(
	taxo: string,
	fetch: (url: string) => Promise<Response>
): Promise<Taxonomy<T>> {
	const res = await fetch(TAXONOMY_URL(taxo));
	return await res.json();
}
