import { describe, expect, it, vi } from 'vitest';
import { frontImageUrl, queryFacetProducts } from './query-facet-products';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

describe('query facet products', () => {
	it('uses find and count, preserving pagination, sorting, and image metadata', async () => {
		const fetch = vi.fn(async (url: RequestInfo | URL, _?: RequestInit) =>
			Response.json(
				String(url).endsWith('/count')
					? 13
					: [
							{
								code: '8718452537570',
								lc: 'fr',
								images: { selected: { front: { fr: { rev: '3' } } } }
							}
						]
			)
		);
		const result = await queryFacetProducts(
			fetch,
			'https://query.example',
			'https://images.example',
			'categories',
			'en:teas',
			{ page: 2, pageSize: 5, sortBy: 'nutriscore_score' }
		);
		expect(result?.count).toBe(13);
		expect(result?.products[0].image_front_small_url).toBe(
			'https://images.example/images/products/871/845/253/7570/front_fr.3.200.jpg'
		);
		expect(JSON.parse(String(fetch.mock.calls[0][1]?.body))).toMatchObject({
			filter: { categories_tags: 'en:teas' },
			sort: [['nutriscore_score_opposite', -1]],
			limit: 5,
			skip: 5
		});
	});

	it('does not make a Query request when unconfigured or unsupported', async () => {
		const fetch = vi.fn();
		expect(
			await queryFacetProducts(fetch, '', '', 'categories', 'en:teas', { page: 1, pageSize: 5 })
		).toBeNull();
		expect(
			await queryFacetProducts(fetch, 'https://query.example', '', 'contributors', 'example', {
				page: 1,
				pageSize: 5
			})
		).toBeNull();
		expect(fetch).not.toHaveBeenCalled();
	});

	it('leaves the image unset when no selected front image exists', () => {
		expect(frontImageUrl({ code: '123' } as Product, 'https://images.example')).toBeUndefined();
	});
});
