import type { ProductContext } from '$lib/commands/types';

type ProductRouteInput = {
	params: Record<string, string>;
	route: {
		id: string | null;
	};
	data: Record<string, unknown>;
	url: URL;
};

function getProductName(data: Record<string, unknown>) {
	const state = data.state;
	if (!state || typeof state !== 'object' || !('product' in state)) return undefined;

	const product = state.product;
	if (!product || typeof product !== 'object' || !('product_name' in product)) return undefined;

	const productName = product.product_name;
	return typeof productName === 'string' && productName.trim() !== '' ? productName : undefined;
}

export function getProductContextFromRoute(page: ProductRouteInput): ProductContext {
	const barcode = page.params.barcode;
	const routeId = page.route.id;
	const isProductRoute = routeId?.startsWith('/products/[barcode]') === true;

	if (!isProductRoute || !barcode) {
		return {
			currentPath: page.url.pathname
		};
	}

	return {
		barcode,
		productName: getProductName(page.data),
		currentPath: page.url.pathname
	};
}
