import { createProductsApi } from '#lib/api.js';
import { compareStore } from '#lib/stores/compareStore.js';
import type { ToastContext } from '#lib/stores/toasts.js';
import { _ } from 'svelte-i18n';
import { get } from 'svelte/store';

export async function addProductToComparison(code: string, toastCtx: ToastContext) {
	try {
		const productsApi = createProductsApi(fetch);
		const { data, error } = await productsApi.getProductV3(code);
		if (error != null || data?.status === 'failure' || data?.product == null) {
			throw new Error('Could not load product details for comparison');
		}

		// @ts-expect-error - SDK response typing for getProductV3 product payload is incompatible here
		const ok = compareStore.addProduct(data.product);
		if (!ok) {
			toastCtx.warning(
				get(_)('product.menu.add_to_comparison_failed', {
					default: 'Product is already in comparison or comparison list is full'
				})
			);
			return;
		}

		toastCtx.success(
			get(_)('product.menu.added_to_comparison', {
				default: 'Product added to comparison'
			})
		);
	} catch (error) {
		console.error('Failed to load product for comparison:', error);
		toastCtx.error(
			get(_)('product.menu.load_for_comparison_failed', {
				default: 'Could not load product details for comparison'
			})
		);
	}
}
