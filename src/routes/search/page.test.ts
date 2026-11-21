import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writable } from 'svelte/store';

const { compatSearch, getBulkProductCardsByCode, getBulkProductAttributes } = vi.hoisted(() => ({
	compatSearch: vi.fn(),
	getBulkProductCardsByCode: vi.fn().mockResolvedValue({}),
	getBulkProductAttributes: vi.fn().mockResolvedValue({})
}));

vi.mock('#lib/api/search.js', () => ({ compatSearch }));
vi.mock('#lib/api/product.js', () => ({
	getBulkProductCardsByCode,
	getBulkProductAttributes,
	createProductsApi: () => ({ getAttributeGroups: vi.fn().mockResolvedValue([]) })
}));
vi.mock('#lib/api/prices.js', () => ({
	createPricesApi: () => ({ getProducts: vi.fn().mockResolvedValue({ data: { items: [] } }) }),
	isConfigured: () => false
}));
vi.mock('#lib/settings.js', () => ({
	preferences: writable({ locale: 'fr-FR', country: 'world' }),
	getLanguageCode: (locale: string) => locale?.split('-')[0] || 'en'
}));

import { load } from './+page';

describe('search page loader barcode redirection and language handling', () => {
	beforeEach(() => {
		compatSearch.mockReset();
		getBulkProductCardsByCode.mockClear();
	});

	it('throws 400 when query parameter is missing', async () => {
		const event = {
			fetch,
			url: new URL('https://example.com/search')
		};
		await expect(load(event as never)).rejects.toMatchObject({ status: 400 });
	});

	it('redirects with 308 for a valid EAN-13 barcode', async () => {
		const event = {
			fetch,
			url: new URL('https://example.com/search?q=3017620422003')
		};
		await expect(load(event as never)).rejects.toMatchObject({
			status: 308,
			location: '/products/3017620422003'
		});
		expect(compatSearch).not.toHaveBeenCalled();
	});

	it('redirects with 308 for a valid UPC (GTIN-12) barcode', async () => {
		const event = {
			fetch,
			url: new URL('https://example.com/search?q=011110038364')
		};
		await expect(load(event as never)).rejects.toMatchObject({
			status: 308,
			location: '/products/011110038364'
		});
		expect(compatSearch).not.toHaveBeenCalled();
	});

	it('redirects with 308 for a valid GTIN-8 barcode', async () => {
		const event = {
			fetch,
			url: new URL('https://example.com/search?q=96385074')
		};
		await expect(load(event as never)).rejects.toMatchObject({
			status: 308,
			location: '/products/96385074'
		});
		expect(compatSearch).not.toHaveBeenCalled();
	});

	it('redirects with 308 for internal store codes', async () => {
		const event = {
			fetch,
			url: new URL('https://example.com/search?q=123456')
		};
		await expect(load(event as never)).rejects.toMatchObject({
			status: 308,
			location: '/products/123456'
		});
		expect(compatSearch).not.toHaveBeenCalled();
	});

	it('redirects with 308 for GS1 Digital Link URLs', async () => {
		const event = {
			fetch,
			url: new URL('https://example.com/search?q=https://id.example.com/01/00012345678905')
		};
		await expect(load(event as never)).rejects.toMatchObject({
			status: 308,
			location: '/products/00012345678905'
		});
		expect(compatSearch).not.toHaveBeenCalled();
	});

	it('passes preferred language to compatSearch for text searches', async () => {
		compatSearch.mockResolvedValue({
			data: {
				hits: [],
				count: 0,
				page: 1,
				facets: {},
				charts: {}
			}
		});

		const event = {
			fetch,
			url: new URL('https://example.com/search?q=chocolate')
		};

		await load(event as never);

		expect(compatSearch).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				q: 'chocolate',
				langs: ['fr']
			})
		);
	});
});
