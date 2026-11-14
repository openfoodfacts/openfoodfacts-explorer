import { describe, expect, it } from 'vitest';
import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
import { getFrontImage } from './frontImage.js';

const product = {
	lang: 'fr',
	image_front_url: 'fallback',
	image_front_small_url: 'fallback-small',
	selected_images: {
		front: {
			display: { en: 'english-400', fr: 'french-400', de: 'german-400' },
			small: { en: 'english-200', fr: 'french-200', de: 'german-200' }
		}
	},
	images: {
		front_en: { sizes: { 100: { w: 63 }, 400: { w: 254 } } },
		front_fr: { sizes: { 100: { w: 75 }, 400: { w: 300 } } }
	}
} as unknown as Product;

describe('getFrontImage', () => {
	it('pairs the requested language URL and metadata', () => {
		expect(getFrontImage(product, 'en', 'display')).toEqual({
			src: 'english-400',
			imageSizes: { 100: { w: 63 }, 400: { w: 254 } }
		});
	});
	it('falls back to the product language and uses the requested variant', () => {
		expect(getFrontImage(product, 'es', 'small')).toEqual({
			src: 'french-200',
			imageSizes: { 100: { w: 75 }, 400: { w: 300 } }
		});
	});
	it('falls back to English and then alphabetically when needed', () => {
		const withoutProductLanguage = { ...product, lang: 'it' } as Product;
		expect(getFrontImage(withoutProductLanguage, 'es', 'display').src).toBe('english-400');
		const withoutEnglish = {
			...withoutProductLanguage,
			selected_images: { front: { display: { fr: 'french-400', de: 'german-400' } } }
		} as unknown as Product;
		expect(getFrontImage(withoutEnglish, 'es', 'display').src).toBe('german-400');
	});
	it('does not use another language’s dimensions when metadata is missing', () => {
		expect(getFrontImage(product, 'de', 'display')).toEqual({
			src: 'german-400',
			imageSizes: undefined
		});
	});
	it('retains the original source when language URLs are unavailable', () => {
		expect(
			getFrontImage({ image_front_url: 'fallback' } as unknown as Product, 'en', 'display')
		).toEqual({ src: 'fallback', imageSizes: undefined });
	});
});
