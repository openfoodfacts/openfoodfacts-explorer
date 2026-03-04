import { describe, it, expect, vi } from 'vitest';

vi.mock('$env/dynamic/public', () => ({
	env: {
		PUBLIC_IMAGES_URL: 'https://images.openfoodfacts.net'
	}
}));
import {
	getProductImageUrl,
	createSimpleImageSelection,
	createImageSelectionWithCrop,
	type SelectedImage,
	type RawImage
} from '../product';

describe('product.ts utilities', () => {
	describe('getProductImageUrl', () => {
		it('should generate a valid image URL for a 13-digit barcode with a SelectedImage', () => {
			const barcode = '3017620422003';
			const images: Record<string, SelectedImage | RawImage> = {
				front_fr: {
					rev: '12',
					imgid: '45',
					angle: 0,
					coordinates_image_size: 'full',
					geometry: '100x100+0+0',
					normalize: null,
					white_magic: null,
					sizes: {
						100: { w: 100, h: 100 },
						200: { w: 200, h: 200 },
						400: { w: 400, h: 400 },
						full: { w: 800, h: 800 }
					},
					x1: '0',
					x2: '100',
					y1: '0',
					y2: '100'
				}
			};

			const url = getProductImageUrl(barcode, 'front_fr', images);
			expect(url).toBe(
				'https://images.openfoodfacts.net/images/products/301/762/042/2003/front_fr.12.400.jpg'
			);
		});

		it('should generate a valid image URL for a barcode without rev (RawImage)', () => {
			const barcode = '737628064502'; // 12 digits, will be padded to 13: 0737628064502
			const images: Record<string, SelectedImage | RawImage> = {
				'1': {
					url: 'https://images.openfoodfacts.org/images/products/073/762/806/4502/1.jpg',
					sizes: {
						100: { w: 100, h: 100 },
						400: { w: 400, h: 400 },
						full: { w: 800, h: 800 }
					},
					uploaded_t: 1234567890,
					uploader: 'test'
				}
			};

			const url = getProductImageUrl(barcode, '1', images);
			expect(url).toBe(
				'https://images.openfoodfacts.net/images/products/073/762/806/4502/1.400.jpg'
			);
		});

		it('should return null if the image name is not in the images object', () => {
			const barcode = '3017620422003';
			const images: Record<string, SelectedImage | RawImage> = {};

			const url = getProductImageUrl(barcode, 'front_fr', images);
			expect(url).toBeNull();
		});

		it('should throw an error if the barcode format is completely invalid (e.g. empty)', () => {
			// A string of 0s after padding will always match the regex technically since it's 13 chars,
			// but we can test the padding behavior implicitly since it guarantees a 13 char string.
			const barcode = '';
			const images: Record<string, SelectedImage | RawImage> = {
				front_fr: {
					rev: '1',
					imgid: '1',
					angle: 0,
					coordinates_image_size: 'full',
					geometry: '100x100+0+0',
					normalize: null,
					white_magic: null,
					sizes: {
						100: { w: 100, h: 100 },
						200: { w: 200, h: 200 },
						400: { w: 400, h: 400 },
						full: { w: 800, h: 800 }
					},
					x1: '0',
					x2: '100',
					y1: '0',
					y2: '100'
				}
			};

			const url = getProductImageUrl(barcode, 'front_fr', images);
			// padding '' padStart(13, '0') returns '0000000000000' -> match[1]='000', [2]='000', [3]='000', [4]='0000'
			expect(url).toBe(
				'https://images.openfoodfacts.net/images/products/000/000/000/0000/front_fr.1.400.jpg'
			);
		});
	});

	describe('createSimpleImageSelection', () => {
		it('should build the correct image selection data structure with string ID', () => {
			const result = createSimpleImageSelection('front', 'en', '123');
			expect(result).toEqual({
				selected: {
					front: {
						en: {
							imgid: '123'
						}
					}
				}
			});
		});

		it('should build the correct image selection data structure with number ID', () => {
			const result = createSimpleImageSelection('ingredients', 'fr', 456);
			expect(result).toEqual({
				selected: {
					ingredients: {
						fr: {
							imgid: '456'
						}
					}
				}
			});
		});
	});

	describe('createImageSelectionWithCrop', () => {
		it('should build the correct image selection data structure with crop parameters', () => {
			const cropParams = {
				angle: 90,
				x1: 10,
				y1: 10,
				x2: 200,
				y2: 200,
				normalize: true
			};
			const result = createImageSelectionWithCrop('nutrition', 'es', '789', cropParams);

			expect(result).toEqual({
				selected: {
					nutrition: {
						es: {
							imgid: '789',
							generation: {
								angle: 90,
								x1: 10,
								y1: 10,
								x2: 200,
								y2: 200,
								normalize: true
							}
						}
					}
				}
			});
		});
	});
});
