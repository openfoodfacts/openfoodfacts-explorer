import { describe, expect, it, vi } from 'vitest';
import {
	getBulkProductAttributesAndImages,
	getBulkProductCardsAndAttributes
} from './bulk-product-details';

describe('getBulkProductAttributesAndImages', () => {
	it('fetches attributes and images together and indexes them by barcode', async () => {
		const fetch = vi.fn(async () =>
			Response.json({
				products: [
					{
						code: '2',
						attribute_groups: [],
						image_front_small_url: 'https://images.example/2.jpg'
					},
					{ code: '1', attribute_groups: [] }
				]
			})
		);
		const result = await getBulkProductAttributesAndImages(fetch, ['1', '2']);
		expect(fetch).toHaveBeenCalledOnce();
		const input = (fetch.mock.calls[0] as unknown[])[0];
		const url = new URL(input instanceof Request ? input.url : String(input));
		expect(url.searchParams.get('page_size')).toBe('2');
		expect(url.searchParams.get('fields')?.split(',')).toContain('image_front_small_url');
		expect(url.searchParams.get('fields')?.split(',')).toContain('attribute_groups');
		expect(result).toEqual({
			attributesByCode: { '1': [], '2': [] },
			imagesByCode: { '2': 'https://images.example/2.jpg' }
		});
	});
});

describe('getBulkProductCardsAndAttributes', () => {
	it('fetches card fields and attributes in one request per 100 codes', async () => {
		const toUrl = (input: unknown) => new URL(input instanceof Request ? input.url : String(input));
		// Each batch answers with a product named after its first requested code
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const first = toUrl(input).searchParams.get('code')!.split(',')[0];
			return Response.json({
				products: [{ code: first, product_name: `Product ${first}`, attribute_groups: [] }]
			});
		});
		const codes = Array.from({ length: 150 }, (_, i) => String(i + 1));
		const result = await getBulkProductCardsAndAttributes(fetch, codes);

		const urls = (fetch.mock.calls as unknown[][]).map(([input]) => toUrl(input));
		expect(urls.map((url) => url.searchParams.get('code'))).toEqual([
			codes.slice(0, 100).join(','),
			codes.slice(100).join(',')
		]);
		expect(urls.map((url) => url.searchParams.get('page_size'))).toEqual(['100', '50']);
		const fields = urls[0].searchParams.get('fields')?.split(',');
		expect(fields).toContain('attribute_groups');
		expect(fields).toContain('image_front_small_url');
		expect(result.cardsByCode['1']).toMatchObject({ code: '1', product_name: 'Product 1' });
		expect(result.cardsByCode['101']).toMatchObject({ code: '101', product_name: 'Product 101' });
		expect(result.attributesByCode).toEqual({ '1': [], '101': [] });
	});
});
