import { describe, expect, it } from 'vitest';
import { getImageSrcset } from './imageSizes.js';

describe('getImageSrcset', () => {
	it('uses the supplied URLs and actual widths', () => {
		expect(
			getImageSrcset({ 100: { url: 'thumbnail', w: 63 }, 400: { url: 'display', w: 254 } })
		).toBe('thumbnail 63w, display 254w');
	});
	it('omits missing URLs, invalid widths and duplicate widths', () => {
		expect(getImageSrcset({ 100: { w: 50 }, 400: { url: 'display', w: 0 } })).toBeUndefined();
		expect(
			getImageSrcset({ 100: { url: 'thumbnail', w: 50 }, 400: { url: 'display', w: 50 } })
		).toBe('thumbnail 50w');
	});
});
