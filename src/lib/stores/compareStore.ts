import { persisted } from 'svelte-local-storage-store';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

export const MAX_COMPARE_PRODUCTS = 4;

const compareProducts = persisted<Product[]>('compareProducts', []);

export const compareStore = {
	subscribe: compareProducts.subscribe,
	addProduct: (product: Product): boolean => {
		if (!product || !product.code || String(product.code).trim() === '') return false;
		let added = false;
		compareProducts.update((products) => {
			const cleanCode = String(product.code).trim();
			if (products.some((p) => p.code != null && String(p.code).trim() === cleanCode))
				return products;
			if (products.length >= MAX_COMPARE_PRODUCTS) return products;
			added = true;
			return [...products, product];
		});
		return added;
	},
	removeProduct: (code: string) => {
		const cleanCode = code != null ? String(code).trim() : '';
		compareProducts.update((products) =>
			products.filter((p) => p.code == null || String(p.code).trim() !== cleanCode)
		);
	},
	clear: () => {
		compareProducts.set([]);
	},
	reorder: (fromIndex: number, toIndex: number) => {
		compareProducts.update((products) => {
			const updatedProducts = [...products];
			const [movedProduct] = updatedProducts.splice(fromIndex, 1);
			updatedProducts.splice(toIndex, 0, movedProduct);
			return updatedProducts;
		});
	}
};
