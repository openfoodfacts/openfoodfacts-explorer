import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import OffImage from './OffImage.svelte';

describe('OffImage', () => {
	const src = 'https://images.openfoodfacts.org/images/products/123/front_en.1.400.jpg';

	it('uses the actual variant widths and keeps the original source', () => {
		const { body } = render(OffImage, {
			props: { src, alt: '', imageSizes: { 100: { w: 67 }, 400: { w: 267 } } }
		});
		expect(body).toContain(`src="${src}"`);
		expect(body).toContain('front_en.1.100.jpg 67w,');
		expect(body).toContain('front_en.1.400.jpg 267w');
	});

	it('keeps the source without a srcset when dimensions are unavailable', () => {
		const { body } = render(OffImage, { props: { src, alt: '' } });
		expect(body).toContain(`src="${src}"`);
		expect(body).not.toContain('srcset=');
	});

	it('omits duplicate or invalid widths and does not rewrite unrelated URLs', () => {
		const { body } = render(OffImage, {
			props: { src, alt: '', imageSizes: { 100: { w: 80 }, 400: { w: 80 } } }
		});
		expect(body).toContain('front_en.1.100.jpg 80w');
		expect(body).not.toContain('front_en.1.400.jpg 80w');
		const other = render(OffImage, {
			props: { src: '/image.jpg', alt: '', imageSizes: { 100: { w: 0 }, 400: { w: 200 } } }
		});
		expect(other.body).not.toContain('srcset=');
	});
});
