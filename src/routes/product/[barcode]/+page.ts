import type { ProductState } from '$lib/product';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch }) => {
	const barcode = params.barcode;

	const res = await fetch(
		'https://world.openfoodfacts.org/api/v3/product/' + barcode + '?fields=all,knowledge_panels'
	);
	const state = (await res.json()) as ProductState;

	return {
		state: state
	};
}) satisfies PageLoad;
