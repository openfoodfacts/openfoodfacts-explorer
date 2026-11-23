import { describe, expect, it, vi } from 'vitest';
import { load } from './+page';
import { getBulkProductCardsByCode } from '#lib/api/product.js';

const { search } = vi.hoisted(() => ({ search: vi.fn() }));

vi.mock('#lib/api/product.js', () => ({ getBulkProductCardsByCode: vi.fn() }));
vi.mock('#lib/api/search.js', () => ({ createSearchApi: () => ({ search }) }));

describe('Explore page loader', () => {
	it('only keeps Query products with bulk cards', async () => {
		const card = { code: '123', product_name: 'Product' };
		vi.mocked(getBulkProductCardsByCode).mockResolvedValue({ '123': card } as never);
		const querySections = [
			'Snacks',
			'Beverages',
			'Dairies',
			'Breakfasts',
			'Meats',
			'Fruits',
			'Vegetables',
			'Cereals',
			'Sweets',
			'Sauces'
		].map((category) => ({ category, products: [] as { code: string; scans_n?: number }[] }));
		querySections[0].products = [{ code: '123', scans_n: 3 }, { code: '456' }];
		querySections[1].products = [{ code: '789' }];
		const result = await load({ fetch, data: { querySections } } as unknown as Parameters<
			typeof load
		>[0]);
		if (!result) throw new Error('Expected Explore results');
		expect(result.sections).toEqual([
			{ category: 'Snacks', products: [{ code: '123', scans_n: 3 }] }
		]);
		expect(result.productCardsByCode['123']).toEqual(card);
	});

	it('uses Search only for failed Query categories and omits empty Query results', async () => {
		search.mockReset();
		const searchProduct = { code: 'search', product_name: 'Search product' };
		search.mockResolvedValue({ data: { hits: [searchProduct] } });
		vi.mocked(getBulkProductCardsByCode).mockResolvedValue({
			query: { code: 'query', product_name: 'Query product' }
		} as never);
		const querySections = [
			null,
			{ category: 'Beverages', products: [] },
			{ category: 'Dairies', products: [{ code: 'query', scans_n: 2 }] },
			...['Breakfasts', 'Meats', 'Fruits', 'Vegetables', 'Cereals', 'Sweets', 'Sauces'].map(
				(category) => ({ category, products: [] })
			)
		];
		const result = await load({ fetch, data: { querySections } } as unknown as Parameters<
			typeof load
		>[0]);
		if (!result) throw new Error('Expected Explore results');
		expect(search).toHaveBeenCalledOnce();
		expect(search).toHaveBeenCalledWith(expect.objectContaining({ q: 'categories:"en:snacks"' }));
		expect(result.sections).toEqual([
			{ category: 'Snacks', products: [searchProduct] },
			{ category: 'Dairies', products: [{ code: 'query', scans_n: 2 }] }
		]);
	});
});
