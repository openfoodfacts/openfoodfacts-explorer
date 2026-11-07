import { describe, expect, it, vi } from 'vitest';
import { getBulkProductAttributesAndImages } from './bulk-product-details';

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
