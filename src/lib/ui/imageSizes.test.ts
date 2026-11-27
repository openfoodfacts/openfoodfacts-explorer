import { describe, expect, it } from 'vitest';
import { getImageSrcset, getPanelImageSizes, getSelectedImageSizes } from './imageSizes.js';

describe('getImageSrcset', () => {
	it('uses the supplied URLs and actual widths', () => {
		expect(
			getImageSrcset({ 100: { url: 'thumbnail', w: 63 }, 400: { url: 'display', w: 254 } })
		).toBe('thumbnail 63w, display 254w');
	});
	it('accepts explicitly supplied variants regardless of their size labels', () => {
		expect(getImageSrcset({ 250: { url: 'medium', w: 180 }, 800: { url: 'large', w: 600 } })).toBe(
			'medium 180w'
		);
		expect(getImageSrcset({ full: { url: 'full', w: 1200 } } as never)).toBeUndefined();
	});
	it('omits missing URLs, invalid widths and duplicate widths', () => {
		expect(getImageSrcset({ 100: { w: 50 }, 400: { url: 'display', w: 0 } })).toBeUndefined();
		expect(
			getImageSrcset({ 100: { url: 'thumbnail', w: 50 }, 400: { url: 'display', w: 50 } })
		).toBe('thumbnail 50w');
	});
});

describe('getSelectedImageSizes', () => {
	it('uses the small variant only when its metadata and URL are available', () => {
		const product = {
			images: { front_en: { sizes: { 100: { w: 80 }, 200: { w: 160 }, 400: { w: 320 } } } },
			selected_images: {
				front: { thumb: { en: 'thumb' }, small: { en: 'small' }, display: { en: 'display' } }
			}
		};
		expect(getImageSrcset(getSelectedImageSizes(product, 'front', 'en'))).toBe(
			'thumb 80w, small 160w, display 320w'
		);
		delete (product.selected_images.front as { small?: unknown }).small;
		expect(getImageSrcset(getSelectedImageSizes(product, 'front', 'en'))).toBe(
			'thumb 80w, display 320w'
		);
	});
});

describe('getPanelImageSizes', () => {
	it('uses API or SDK widths and skips duplicate and invalid candidates', () => {
		const sizes = {
			100: { url: 'thumb', w: 56 },
			200: { url: 'small', width: 113 },
			400: { url: 'display', w: 225 },
			full: { url: 'full', w: 1200 },
			800: { url: 'large', w: 600 },
			invalid: { url: 'invalid' }
		};
		expect(getImageSrcset(getPanelImageSizes(sizes))).toBe('thumb 56w, small 113w, display 225w');
		expect(getPanelImageSizes()).toBeUndefined();
	});
});
