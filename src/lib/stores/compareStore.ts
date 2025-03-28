import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { ProductReduced } from '$lib/api/product';

export const MAX_COMPARE_PRODUCTS = 4;

function createCompareStore() {
	const getInitialState = (): ProductReduced[] => {
		if (browser) {
			const saved = localStorage.getItem('compareProducts');
			return saved ? JSON.parse(saved) : [];
		}
		return [];
	};

	const { subscribe, update, set } = writable<ProductReduced[]>(getInitialState());

	if (browser) {
		subscribe((products) => {
			localStorage.setItem('compareProducts', JSON.stringify(products));
		});
	}

	return {
		subscribe,

		addProduct: (product: ProductReduced) => {
			update((products) => {
				if (products.some((p) => p.code === product.code)) {
					return products;
				}

				if (products.length >= MAX_COMPARE_PRODUCTS) {
					return products;
				}

				return [...products, product];
			});
		},

		removeProduct: (productCode: string) => {
			update((products) => products.filter((p) => p.code !== productCode));
		},

		clear: () => {
			set([]);
		}
	};
}

export const compareStore = createCompareStore();
