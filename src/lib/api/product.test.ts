import { describe, it, expect, vi } from 'vitest';
import {
	cleanPackagingComponent,
	getProductImageUrl,
	createSimpleImageSelection,
	createImageSelectionWithCrop,
	getBulkProductAttributes,
	updateBarcode,
	moveImages,
	deleteImages,
	deleteProduct,
	type PackagingComponent,
	type ImageGenerationParameters,
	type SelectedImage,
	type RawImage
} from './product';

describe('product API service & pure utilities', () => {
	describe('cleanPackagingComponent data transformation & regressions', () => {
		it('preserves 0 for numeric fields (regression check for falsy value dropping)', () => {
			const component: PackagingComponent = {
				number_of_units: 0,
				weight_measured: 0
			};

			const result = cleanPackagingComponent(component);

			expect(result.number_of_units).toBe(0);
			expect(result.weight_measured).toBe(0);
		});

		it('prioritizes lc_name over id for taxonomy fields', () => {
			const component: PackagingComponent = {
				shape: { lc_name: 'Bouteille', id: 'en:bottle' },
				material: { lc_name: 'Verre', id: 'en:glass' },
				recycling: { lc_name: 'À recycler', id: 'en:recycle' }
			};

			const result = cleanPackagingComponent(component);

			expect(result.shape).toBe('Bouteille');
			expect(result.material).toBe('Verre');
			expect(result.recycling).toBe('À recycler');
		});

		it('falls back to taxonomy id when lc_name is absent', () => {
			const component: PackagingComponent = {
				shape: { id: 'en:bottle' },
				material: { id: 'en:glass' },
				recycling: { id: 'en:recycle' }
			};

			const result = cleanPackagingComponent(component);

			expect(result.shape).toBe('en:bottle');
			expect(result.material).toBe('en:glass');
			expect(result.recycling).toBe('en:recycle');
		});

		it('omits taxonomy fields when object is empty or undefined', () => {
			const component: PackagingComponent = {
				shape: {},
				quantity_per_unit: undefined
			};

			const result = cleanPackagingComponent(component);

			expect(result).not.toHaveProperty('shape');
			expect(result).not.toHaveProperty('quantity_per_unit');
			expect(Object.keys(result)).toHaveLength(0);
		});

		it('includes quantity_per_unit when populated', () => {
			const component: PackagingComponent = {
				quantity_per_unit: '330 ml'
			};

			const result = cleanPackagingComponent(component);

			expect(result.quantity_per_unit).toBe('330 ml');
		});
	});

	describe('getProductImageUrl path construction & barcode partitioning', () => {
		it('partitions standard 13-digit EAN barcode into directory hierarchy with revision', () => {
			const barcode = '3017620422003';
			const images: Record<string, SelectedImage | RawImage> = {
				front_en: { rev: '4' } as unknown as SelectedImage
			};

			const url = getProductImageUrl(barcode, 'front_en', images);

			expect(url).toContain('301/762/042/2003/front_en.4.400.jpg');
		});

		it('pads shorter barcodes (EAN-8 / UPC) to 13 digits before partitioning', () => {
			const barcode = '12345670'; // 8 digits
			const images: Record<string, SelectedImage | RawImage> = {
				'1': {} as unknown as RawImage
			};

			const url = getProductImageUrl(barcode, '1', images);

			// 12345670 padded to 13 digits -> 0000012345670 -> 000/001/234/5670
			expect(url).toContain('000/001/234/5670/1.400.jpg');
		});

		it('handles raw images without rev property using unversioned filename', () => {
			const barcode = '3017620422003';
			const images: Record<string, SelectedImage | RawImage> = {
				'1': { uploaded_t: 1600000000 } as unknown as RawImage
			};

			const url = getProductImageUrl(barcode, '1', images);

			expect(url).toContain('301/762/042/2003/1.400.jpg');
		});

		it('returns null safely when requested image key is missing from dictionary', () => {
			const barcode = '3017620422003';
			const images = {};

			const url = getProductImageUrl(barcode, 'missing_image_key', images);

			expect(url).toBeNull();
		});
	});

	describe('image selection payload builders', () => {
		it('createSimpleImageSelection normalizes numeric imgid to string in nested structure', () => {
			const selection = createSimpleImageSelection('front', 'en', 42);

			expect(selection).toEqual({
				selected: {
					front: {
						en: {
							imgid: '42'
						}
					}
				}
			});
		});

		it('createImageSelectionWithCrop includes generation parameters', () => {
			const cropParams: ImageGenerationParameters = {
				x1: 10,
				y1: 20,
				x2: 300,
				y2: 400,
				angle: 90
			};

			const selection = createImageSelectionWithCrop('nutrition', 'fr', '5', cropParams);

			expect(selection).toEqual({
				selected: {
					nutrition: {
						fr: {
							imgid: '5',
							generation: cropParams
						}
					}
				}
			});
		});
	});

	describe('getBulkProductAttributes', () => {
		it('returns empty record immediately without calling fetch when productCodes is empty', async () => {
			const mockFetch = vi.fn();

			const result = await getBulkProductAttributes(mockFetch as unknown as typeof fetch, []);

			expect(result).toEqual({});
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it('queries search endpoint and maps attribute_groups by product code', async () => {
			const mockResponse = {
				count: 2,
				products: [
					{
						code: '111',
						product_name: 'Product 1',
						attribute_groups: [{ id: 'nutriscore', title: 'Nutri-Score' }]
					},
					{
						code: '222',
						product_name: 'Product 2',
						attribute_groups: [{ id: 'ecoscore', title: 'Eco-Score' }]
					}
				]
			};

			const mockFetch = vi.fn().mockResolvedValue(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);

			const result = await getBulkProductAttributes(mockFetch as unknown as typeof fetch, [
				'111',
				'222'
			]);

			expect(result['111']).toEqual([{ id: 'nutriscore', title: 'Nutri-Score' }]);
			expect(result['222']).toEqual([{ id: 'ecoscore', title: 'Eco-Score' }]);

			// Verify query parameters passed to fetch
			const callUrl = mockFetch.mock.calls[0]?.[0];
			const urlString = callUrl instanceof Request ? callUrl.url : String(callUrl);
			expect(urlString).toContain('code=111%2C222');
		});

		it('gracefully defaults to empty array when product has undefined attribute_groups', async () => {
			const mockResponse = {
				count: 1,
				products: [
					{
						code: '333',
						product_name: 'Product Without Attributes'
					}
				]
			};

			const mockFetch = vi.fn().mockResolvedValue(
				new Response(JSON.stringify(mockResponse), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);

			const result = await getBulkProductAttributes(mockFetch as unknown as typeof fetch, ['333']);

			expect(result['333']).toEqual([]);
		});

		it('throws descriptive error if search API returns no data', async () => {
			const mockFetch = vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ error: 'Search gateway timeout' }), {
					status: 504,
					headers: { 'Content-Type': 'application/json' }
				})
			);

			await expect(
				getBulkProductAttributes(mockFetch as unknown as typeof fetch, ['444'])
			).rejects.toThrow('No data returned for bulk product attributes');
		});
	});

	describe('moderator actions error resilience & return contracts', () => {
		describe('updateBarcode', () => {
			it('returns { data: success } on successful changeBarcode call', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ status: 1, status_verbose: 'barcode changed' }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await updateBarcode(
					mockFetch as unknown as typeof fetch,
					'old_code',
					'new_code'
				);

				expect(result.data).toBeDefined();
				expect(result.error).toBeUndefined();
			});

			it('catches and returns error message when call fails', async () => {
				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
				const mockFetch = vi.fn().mockRejectedValue(new Error('Permission denied'));

				const result = await updateBarcode(
					mockFetch as unknown as typeof fetch,
					'old_code',
					'new_code'
				);

				expect(result.error).toBe('Permission denied');
				expect(result.data).toBeUndefined();
				consoleSpy.mockRestore();
			});
		});

		describe('moveImages', () => {
			it('returns { data: true } on success', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ status: 'success' }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await moveImages(
					mockFetch as unknown as typeof fetch,
					'111',
					'1,2',
					'222',
					false
				);

				expect(result).toEqual({ data: true });
			});

			it('returns error message when API responds with an error status', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ error: 'Images not found' }), {
						status: 400,
						statusText: 'Bad Request',
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await moveImages(
					mockFetch as unknown as typeof fetch,
					'111',
					'1,2',
					'222',
					false
				);

				expect(result).toEqual({ error: 'Failed to move images: Bad Request' });
			});

			it('catches thrown network error and returns error message', async () => {
				const mockFetch = vi.fn().mockRejectedValue(new Error('Network error moving images'));

				const result = await moveImages(
					mockFetch as unknown as typeof fetch,
					'111',
					'1,2',
					'222',
					false
				);

				expect(result).toEqual({ error: 'Failed to move images' });
			});
		});

		describe('deleteImages', () => {
			it('returns { data: true } on success', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ status: 'success' }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await deleteImages(mockFetch as unknown as typeof fetch, '111', '1');

				expect(result).toEqual({ data: true });
			});

			it('returns error message when delete API responds with non-ok status', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ error: 'Image cannot be trashed' }), {
						status: 403,
						statusText: 'Forbidden',
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await deleteImages(mockFetch as unknown as typeof fetch, '111', '1');

				expect(result).toEqual({ error: 'Failed to move images: Forbidden' });
			});

			it('catches thrown error and returns error message', async () => {
				const mockFetch = vi.fn().mockRejectedValue(new Error('Server error deleting image'));

				const result = await deleteImages(mockFetch as unknown as typeof fetch, '111', '1');

				expect(result).toEqual({ error: 'Failed to move images' });
			});
		});

		describe('deleteProduct', () => {
			it('returns { data: true } when deletion succeeds', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ status: 1 }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await deleteProduct(
					mockFetch as unknown as typeof fetch,
					'123456789',
					'Spam product'
				);

				expect(result).toEqual({ data: true });
			});

			it('catches error when deletion comment is empty', async () => {
				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
				const mockFetch = vi.fn();

				const result = await deleteProduct(mockFetch as unknown as typeof fetch, '123456789', '');

				expect(result.error).toContain('A non-empty deletion comment is required');
				consoleSpy.mockRestore();
			});

			it('catches thrown network error and returns error message', async () => {
				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
				const mockFetch = vi.fn().mockRejectedValue(new Error('Network offline'));

				const result = await deleteProduct(
					mockFetch as unknown as typeof fetch,
					'123456789',
					'Duplicate'
				);

				expect(result).toEqual({ error: 'Network offline' });
				consoleSpy.mockRestore();
			});
		});
	});
});
