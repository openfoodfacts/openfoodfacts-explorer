import type { ProductState } from '$lib/product';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch }) => {
	const barcode = params.barcode;

	const state = (await fetch('https://world.openfoodfacts.org/api/v2/product/' + barcode).then(
		(res) => res.json()
	)) as ProductState;

	const knowledgePanels = await fetch(
		'https://world.openfoodfacts.org/api/v2/product/' + barcode + '?fields=knowledge_panels'
	)
		.then(async (res) => (await res.json()) as ProductState)
		.then((res) => res.product.knowledge_panels);

	return {
		state,
		knowledgePanels
	};
}) satisfies PageLoad;
