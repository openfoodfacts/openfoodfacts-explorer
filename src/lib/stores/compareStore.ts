import { persisted } from 'svelte-local-storage-store';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

export const MAX_COMPARE_PRODUCTS = 4;

const compareProducts = persisted<Product[]>('compareProducts', []);

export const compareStore = {
	subscribe: compareProducts.subscribe,
	addProduct: (product: Product): boolean => {
		let added = false;
		compareProducts.update((products) => {
			if (products.some((p) => p.code === product.code)) return products;
			if (products.length >= MAX_COMPARE_PRODUCTS) return products;
			added = true;
			return [...products, product];
		});
		return added;
	},
	removeProduct: (code: string) => {
		compareProducts.update((products) => products.filter((p) => p.code !== code));
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
