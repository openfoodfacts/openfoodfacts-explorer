import type { ProductState } from '$lib/product';
import { preferences } from '$lib/settings';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';
import type { Category, Label, Store } from '$lib/taxo';

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

	const categories = fetch('https://static.openfoodfacts.org/data/taxonomies/categories.json').then(
		(res) => res.json()
	) as Promise<Record<string, Category>>;

	const labels = fetch('https://static.openfoodfacts.org/data/taxonomies/labels.json').then((res) =>
		res.json()
	) as Promise<Record<string, Label>>;

	const stores = fetch('https://static.openfoodfacts.org/data/taxonomies/stores.json').then((res) =>
		res.json()
	) as Promise<Record<string, Store>>;

	const brands = fetch('https://static.openfoodfacts.org/data/taxonomies/brands.json').then((res) =>
		res.json()
	) as Promise<Record<string, Store>>;

	return {
		state: state,
		taxo: {
			categories: categories,
			labels: labels,
			stores: stores,
			brands
		}
	};
}) satisfies PageLoad;
