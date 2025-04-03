import { persisted } from 'svelte-local-storage-store'
import type { ProductReduced } from '$lib/api/product'

export const MAX_COMPARE_PRODUCTS = 4

const compareProducts = persisted<ProductReduced[]>('compareProducts', [])

export const compareStore = {
  subscribe: compareProducts.subscribe,
  addProduct: (product: ProductReduced) => {
    compareProducts.update((products) => {
      if (products.some((p) => p.code === product.code)) return products
      if (products.length >= MAX_COMPARE_PRODUCTS) return products
      return [...products, product]
    })
  },
  removeProduct: (code: string) => {
    compareProducts.update((products) => products.filter((p) => p.code !== code))
  },
  clear: () => {
    compareProducts.set([])
  }
}
