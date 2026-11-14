import { describe, expect, it } from 'vitest';
import { getImageSizes } from './imageSizes.js';

describe('getImageSizes', () => {
	const sizes = { 100: { w: 60 }, 400: { w: 240 } };
	const images = { front_en: { rev: '12', sizes }, '1': { sizes } };

	it('matches selected revisions and raw image IDs', () => {
		expect(getImageSizes('/front_en.12.400.jpg', images)).toBe(sizes);
		expect(getImageSizes('/1.100.jpg', images)).toBe(sizes);
	});

	it('rejects stale revisions and unknown images', () => {
		expect(getImageSizes('/front_en.11.400.jpg', images)).toBeUndefined();
		expect(getImageSizes('/2.400.jpg', images)).toBeUndefined();
		expect(getImageSizes('/front_en.400.jpg', images)).toBeUndefined();
	});
});
