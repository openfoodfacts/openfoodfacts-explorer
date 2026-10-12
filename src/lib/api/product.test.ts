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

const asFetch = (mock: unknown) => mock as typeof fetch;

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

			const result = await getBulkProductAttributes(asFetch(mockFetch), []);

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

			const result = await getBulkProductAttributes(asFetch(mockFetch), ['111', '222']);

			expect(result['111']).toEqual([{ id: 'nutriscore', title: 'Nutri-Score' }]);
			expect(result['222']).toEqual([{ id: 'ecoscore', title: 'Eco-Score' }]);

			// Verify query parameters passed to fetch by parsing search params
			const callUrl = mockFetch.mock.calls[0]?.[0];
			const urlString = callUrl instanceof Request ? callUrl.url : String(callUrl);
			const parsedUrl = new URL(urlString);
			expect(parsedUrl.searchParams.get('code')).toBe('111,222');
			const requestedFields = parsedUrl.searchParams.get('fields')?.split(',') ?? [];
			expect(requestedFields).toContain('code');
			expect(requestedFields).toContain('attribute_groups');
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

			const result = await getBulkProductAttributes(asFetch(mockFetch), ['333']);

			expect(result['333']).toEqual([]);
		});

		it('throws descriptive error if search API returns no data', async () => {
			const mockFetch = vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ error: 'Search gateway timeout' }), {
					status: 504,
					headers: { 'Content-Type': 'application/json' }
				})
			);

			await expect(getBulkProductAttributes(asFetch(mockFetch), ['444'])).rejects.toThrow(
				'No data returned for bulk product attributes'
			);
		});
	});

	describe('moderator actions error resilience, return contracts & request verification', () => {
		describe('updateBarcode', () => {
			it('returns { data: true } and submits barcode change to correct endpoint', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ status: 1, status_verbose: 'barcode changed' }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await updateBarcode(asFetch(mockFetch), 'old_code', 'new_code');

				expect(result).toEqual({ data: true });

				// Verify endpoint and FormData payload
				const [callUrl, callInit] = mockFetch.mock.calls[0] ?? [];
				const url = callUrl instanceof Request ? callUrl.url : String(callUrl);
				expect(url).toContain('/cgi/product_jqm2.pl');
				const body = (callInit?.body as FormData) ?? (await (callUrl as Request).formData());
				expect(body?.get('code')).toBe('old_code');
				expect(body?.get('new_code')).toBe('new_code');
			});

			it('catches and returns error message when call fails', async () => {
				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
				const mockFetch = vi.fn().mockRejectedValue(new Error('Permission denied'));

				const result = await updateBarcode(asFetch(mockFetch), 'old_code', 'new_code');

				expect(result.error).toBe('Permission denied');
				expect(result.data).toBeUndefined();
				consoleSpy.mockRestore();
			});
		});

		describe('moveImages', () => {
			it('returns { data: true } and submits move parameters to correct endpoint', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ status: 'success' }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await moveImages(asFetch(mockFetch), '111', '1,2', '222', true);

				expect(result).toEqual({ data: true });

				// Verify request endpoint and FormData parameters
				const [callUrl, callInit] = mockFetch.mock.calls[0] ?? [];
				const url = callUrl instanceof Request ? callUrl.url : String(callUrl);
				expect(url).toContain('/cgi/product_image_move.pl');
				const body = (callInit?.body as FormData) ?? (await (callUrl as Request).formData());
				expect(body?.get('code')).toBe('111');
				expect(body?.get('imgids')).toBe('1,2');
				expect(body?.get('move_to_override')).toBe('222');
				expect(body?.get('copy_data_override')).toBe('true');
			});

			it('returns error message when API responds with an error status', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ error: 'Images not found' }), {
						status: 400,
						statusText: 'Bad Request',
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await moveImages(asFetch(mockFetch), '111', '1,2', '222', false);

				expect(result.error).toMatch(/Bad Request/i);
			});

			it('catches thrown network error and returns error message', async () => {
				const mockFetch = vi.fn().mockRejectedValue(new Error('Network error moving images'));

				const result = await moveImages(asFetch(mockFetch), '111', '1,2', '222', false);

				// Note: upstream SDK normalizes network errors to a generic failure message
				expect(result.error).toBeDefined();
			});
		});

		describe('deleteImages', () => {
			it('returns { data: true } and submits trash move parameters to correct endpoint', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ status: 'success' }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await deleteImages(asFetch(mockFetch), '111', '1');

				expect(result).toEqual({ data: true });

				// Verify delete requests trash override
				const [callUrl, callInit] = mockFetch.mock.calls[0] ?? [];
				const url = callUrl instanceof Request ? callUrl.url : String(callUrl);
				expect(url).toContain('/cgi/product_image_move.pl');
				const body = (callInit?.body as FormData) ?? (await (callUrl as Request).formData());
				expect(body?.get('code')).toBe('111');
				expect(body?.get('imgids')).toBe('1');
				expect(body?.get('move_to_override')).toBe('trash');
				expect(body?.get('copy_data_override')).toBe('false');
			});

			it('returns error message when delete API responds with non-ok status', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ error: 'Image cannot be trashed' }), {
						status: 403,
						statusText: 'Forbidden',
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await deleteImages(asFetch(mockFetch), '111', '1');

				// Avoids brittle assertion on copy-paste "move images" error message from upstream SDK
				expect(result.error).toMatch(/Forbidden/i);
			});

			it('catches thrown error and returns error message', async () => {
				const mockFetch = vi.fn().mockRejectedValue(new Error('Server error deleting image'));

				const result = await deleteImages(asFetch(mockFetch), '111', '1');

				// Note: upstream SDK normalizes errors to a generic failure message
				expect(result.error).toBeDefined();
			});
		});

		describe('deleteProduct', () => {
			it('returns { data: true } and sends correct deletion payload to endpoint', async () => {
				const mockFetch = vi.fn().mockResolvedValue(
					new Response(JSON.stringify({ status: 1 }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' }
					})
				);

				const result = await deleteProduct(asFetch(mockFetch), '123456789', 'Spam product');

				expect(result).toEqual({ data: true });

				// Verify URL and FormData
				const [callUrl, callInit] = mockFetch.mock.calls[0] ?? [];
				const url = callUrl instanceof Request ? callUrl.url : String(callUrl);
				expect(url).toContain('/cgi/product.pl');
				const body = (callInit?.body as FormData) ?? (await (callUrl as Request).formData());
				expect(body?.get('type')).toBe('delete');
				expect(body?.get('action')).toBe('process');
				expect(body?.get('code')).toBe('123456789');
				expect(body?.get('comment')).toBe('Spam product');
			});

			it('catches error when deletion comment is empty without sending a request', async () => {
				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
				const mockFetch = vi.fn();

				const result = await deleteProduct(asFetch(mockFetch), '123456789', '');

				expect(result.error).toContain('A non-empty deletion comment is required');
				expect(mockFetch).not.toHaveBeenCalled();
				consoleSpy.mockRestore();
			});

			it('catches thrown network error and returns error message', async () => {
				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
				const mockFetch = vi.fn().mockRejectedValue(new Error('Network offline'));

				const result = await deleteProduct(asFetch(mockFetch), '123456789', 'Duplicate');

				expect(result).toEqual({ error: 'Network offline' });
				consoleSpy.mockRestore();
			});
		});
	});
});
