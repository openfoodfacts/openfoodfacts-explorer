import type { ProductState } from '$lib/product';
import type { PageLoad } from './$types';

export const load = (async ({ params, fetch }) => {
	const barcode = params.barcode;

	const product = await fetch('https://world.openfoodfacts.org/api/v2/product/' + barcode);
	const productJson = (await product.json()) as ProductState;

	return {
		productState: productJson
	};
}) satisfies PageLoad;
