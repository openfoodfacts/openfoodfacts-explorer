import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addMessages, init } from 'svelte-i18n';
import type { ToastContext } from '#lib/stores/toasts.js';
import { addProductToComparison } from './productComparison';

const { getProductV3, addProduct } = vi.hoisted(() => ({
	getProductV3: vi.fn(),
	addProduct: vi.fn()
}));

vi.mock('#lib/api.js', () => ({
	createProductsApi: () => ({ getProductV3 })
}));
vi.mock('#lib/stores/compareStore.js', () => ({ compareStore: { addProduct } }));

addMessages('en', {});
init({ fallbackLocale: 'en', initialLocale: 'en' });

const toast: ToastContext = {
	toasts: [],
	success: vi.fn(),
	warning: vi.fn(),
	error: vi.fn(),
	info: vi.fn(),
	remove: vi.fn(),
	clear: vi.fn()
};
const product = { code: '3017620422003', product_name: 'Nutella' };

beforeEach(() => {
	vi.resetAllMocks();
	getProductV3.mockResolvedValue({ data: { status: 'success', product } });
	addProduct.mockReturnValue(true);
});

describe('addProductToComparison', () => {
	it('loads the full product before adding it and reports success', async () => {
		await addProductToComparison(product.code, toast);
		expect(getProductV3).toHaveBeenCalledWith(product.code);
		expect(addProduct).toHaveBeenCalledWith(product);
		expect(toast.success).toHaveBeenCalledWith('Product added to comparison');
		expect(toast.error).not.toHaveBeenCalled();
	});

	it('keeps the store rejection warning for duplicates and the comparison limit', async () => {
		addProduct.mockReturnValue(false);
		await addProductToComparison(product.code, toast);
		expect(toast.warning).toHaveBeenCalledWith(
			'Product is already in comparison or comparison list is full'
		);
		expect(toast.success).not.toHaveBeenCalled();
	});

	it.each([
		{ error: new Error('API error') },
		{ data: { status: 'failure' } },
		{ data: { status: 'success' } }
	])('reports an unsuccessful API response without adding a product: %j', async (response) => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			getProductV3.mockResolvedValue(response);
			await addProductToComparison(product.code, toast);
			expect(addProduct).not.toHaveBeenCalled();
			expect(toast.error).toHaveBeenCalledWith('Could not load product details for comparison');
		} finally {
			consoleError.mockRestore();
		}
	});

	it('allows a successful retry after a rejected request', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
		try {
			getProductV3.mockRejectedValueOnce(new Error('Network error'));
			await addProductToComparison(product.code, toast);
			expect(toast.error).toHaveBeenCalledOnce();
			await addProductToComparison(product.code, toast);
			expect(addProduct).toHaveBeenCalledOnce();
			expect(toast.success).toHaveBeenCalledWith('Product added to comparison');
		} finally {
			consoleError.mockRestore();
		}
	});
});
