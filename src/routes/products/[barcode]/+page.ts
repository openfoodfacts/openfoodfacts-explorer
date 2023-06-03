import type { ProductState } from '$lib/product';
import { preferences } from '$lib/settings';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import type { Category, Label, Store } from '$lib/taxo';
import { TAXONOMY_URL } from '$lib/const';

async function getTaxo<T>(
	taxo: string,
	fetch: (url: string) => Promise<Response>
): Promise<Record<string, T>> {
	const res = await fetch(TAXONOMY_URL(taxo));
	return await res.json();
}

export const load = (async ({ params, fetch }) => {
	const barcode = params.barcode;

	const searchParams = new URLSearchParams({
		fields: 'all,knowledge_panels',
		lc: get(preferences).lang
	});

	const res = await fetch(
		'https://world.openfoodfacts.org/api/v3/product/' + barcode + '?' + searchParams.toString()
	);

	const state = (await res.json()) as ProductState;

	const categories = getTaxo('categories', fetch);
	const labels = getTaxo('labels', fetch);
	const stores = getTaxo('stores', fetch);
	const brands = getTaxo('brands', fetch);

	return {
		state,
		taxo: {
			categories,
			labels,
			stores,
			brands
		}
	};
}) satisfies PageLoad;
