import { describe, expect, it } from 'vitest';
import { getGoogleReverseSearchUrl, getYandexReverseSearchUrl } from './imageSearch';

describe('getGoogleReverseSearchUrl', () => {
	it('returns a Google Lens URL with the encoded image URL', () => {
		const url = getGoogleReverseSearchUrl(
			'https://images.openfoodfacts.org/images/products/123/front.jpg'
		);
		expect(url).toBe(
			'https://lens.google.com/uploadbyurl?url=https%3A%2F%2Fimages.openfoodfacts.org%2Fimages%2Fproducts%2F123%2Ffront.jpg'
		);
	});

	it('encodes special characters in the URL', () => {
		const rawUrl = 'https://example.com/image?size=400&type=jpg#main';
		const url = getGoogleReverseSearchUrl(rawUrl);
		expect(url).toBe(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(rawUrl)}`);
	});
});

describe('getYandexReverseSearchUrl', () => {
	it('returns a Yandex Images URL with the encoded image URL', () => {
		const url = getYandexReverseSearchUrl(
			'https://images.openfoodfacts.org/images/products/123/front.jpg'
		);
		expect(url).toBe(
			'https://yandex.com/images/search?rpt=imageview&url=https%3A%2F%2Fimages.openfoodfacts.org%2Fimages%2Fproducts%2F123%2Ffront.jpg'
		);
	});

	it('encodes special characters in the URL', () => {
		const rawUrl = 'https://example.com/image?size=400&type=jpg#main';
		const url = getYandexReverseSearchUrl(rawUrl);
		expect(url).toBe(
			`https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(rawUrl)}`
		);
	});
});
