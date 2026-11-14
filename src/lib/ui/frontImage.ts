import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
import type { ImageSizes } from './imageSizes.js';

type FrontImageProduct = {
	lang?: string;
	lc?: string;
	image_front_url?: string;
	image_front_small_url?: string;
	selected_images?: {
		front?: { display?: Record<string, string>; small?: Record<string, string> };
	};
	images?: Record<string, { sizes?: ImageSizes }>;
};

/** Select a URL and dimensions for the same language, following the server's fallback order. */
export function getFrontImage(product: Product, language: string, size: 'display' | 'small') {
	// The SDK's Product type does not describe the flat images object returned by /api/v3.
	const data = product as unknown as FrontImageProduct;
	const urls = data.selected_images?.front?.[size];
	const languages = Object.keys(urls ?? {}).sort();
	const selectedLanguage = [language, data.lang || data.lc, 'en', ...languages].find(
		(lang) => lang && urls?.[lang]
	);
	if (selectedLanguage && urls) {
		return {
			src: urls[selectedLanguage],
			imageSizes: data.images?.[`front_${selectedLanguage}`]?.sizes
		};
	}
	return {
		src:
			size === 'display'
				? (data.image_front_url ?? data.image_front_small_url)
				: data.image_front_small_url,
		imageSizes: undefined
	};
}
