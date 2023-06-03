import { get } from 'svelte/store';
import { PRODUCT_URL, TAXONOMY_URL } from './const';
import type { ProductState } from './product';
import { preferences } from './settings';
import type { TaxoNode, Taxonomy } from './taxo';

export async function getTaxo<T extends TaxoNode>(
	taxo: string,
	fetch: (url: string) => Promise<Response>
): Promise<Taxonomy<T>> {
	const res = await fetch(TAXONOMY_URL(taxo));
	return await res.json();
}

export async function getProduct(
	barcode: string,
	fetch: (url: string) => Promise<Response>
): Promise<ProductState> {
	const url =
		PRODUCT_URL(barcode) +
		'?' +
		new URLSearchParams({
			fields: 'all,knowledge_panels',
			lc: get(preferences).lang
		});
	const res = await fetch(url);
	return await res.json();
}
