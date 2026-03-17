import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFacetKnowledgePanels, getFacet, getFacetValue } from '../facets';
import { createProductsApi } from '../product';

// Mock the product.ts dependency specifically for createProductsApi
vi.mock('../product', async (importOriginal) => {
	const actual: any = await importOriginal();
	return {
		...actual,
		createProductsApi: vi.fn()
	};
});

describe('facets.ts API', () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockFetch = vi.fn();
		vi.clearAllMocks();
	});

	describe('getFacetKnowledgePanels', () => {
		it('should append only facet_tag to params if value is not provided', async () => {
			mockFetch.mockResolvedValueOnce({
				json: async () => ({ knowledge_panels: {} })
			});

			await getFacetKnowledgePanels(mockFetch as unknown as typeof window.fetch, 'brands');

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const urlStr = mockFetch.mock.calls[0][0] as string;
			const url = new URL(urlStr);

			expect(url.hostname).toBe('facets-kp.openfoodfacts.org');
			expect(url.pathname).toBe('/knowledge_panel');
			expect(url.searchParams.get('facet_tag')).toBe('brands');
			expect(url.searchParams.has('value_tag')).toBe(false);
		});

		it('should append both facet_tag and value_tag to params if value is provided', async () => {
			mockFetch.mockResolvedValueOnce({
				json: async () => ({ knowledge_panels: { some_panel: {} } })
			});

			const result = await getFacetKnowledgePanels(
				mockFetch as unknown as typeof window.fetch,
				'brands',
				'ferrero'
			);

			expect(result).toEqual({ knowledge_panels: { some_panel: {} } });
			expect(mockFetch).toHaveBeenCalledTimes(1);

			const urlStr = mockFetch.mock.calls[0][0] as string;
			const url = new URL(urlStr);

			expect(url.searchParams.get('facet_tag')).toBe('brands');
			expect(url.searchParams.get('value_tag')).toBe('ferrero');
		});
	});

	describe('getFacet', () => {
		it('should pass correct arguments to client.getFacet', async () => {
			const mockClientGetFacet = vi.fn().mockResolvedValue({ data: [] });
			vi.mocked(createProductsApi).mockReturnValue({
				getFacet: mockClientGetFacet
			} as unknown as ReturnType<typeof createProductsApi>);

			const fetchToUse = mockFetch as unknown as typeof window.fetch;
			const opts = { page: 2, pageSize: 20, sortBy: 'popularity' as const };

			await getFacet(fetchToUse, 'brands', opts);

			expect(createProductsApi).toHaveBeenCalledWith(fetchToUse);
			expect(mockClientGetFacet).toHaveBeenCalledWith('brands', opts);
		});
	});

	describe('getFacetValue', () => {
		it('should pass correct arguments to client.getFacetValue', async () => {
			const mockClientGetFacetValue = vi.fn().mockResolvedValue({ data: [] });
			vi.mocked(createProductsApi).mockReturnValue({
				getFacetValue: mockClientGetFacetValue
			} as unknown as ReturnType<typeof createProductsApi>);

			const fetchToUse = mockFetch as unknown as typeof window.fetch;
			const opts = { page: 1, pageSize: 15, sortBy: 'created_t' as const };

			await getFacetValue(fetchToUse, 'countries', 'france', opts);

			expect(createProductsApi).toHaveBeenCalledWith(fetchToUse);
			expect(mockClientGetFacetValue).toHaveBeenCalledWith('countries', 'france', opts);
		});
	});
});
