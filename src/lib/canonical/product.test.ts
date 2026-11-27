import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/env/public', () => ({
	ORIGIN: 'https://explorer.example.org',
	SEO_CANONICAL_TARGET: 'explorer'
}));
import { productOpenerCanonicalUrl, productSeo } from './product.js';

const product = {
	code: '3017620422003',
	product_type: 'food'
};

describe('Product Opener product canonicals', () => {
	it.each([
		['world', 'en', 'world-en'],
		['world', 'fr', 'world-fr'],
		['world', 'kmr', 'world-kmr'],
		['FR', 'fr', 'fr-fr'],
		['DE', 'de', 'de-de'],
		['CH', 'it', 'ch-it'],
		['GB', 'en', 'uk-en']
	])('maps %s and %s to the %s subdomain', (country, language, subdomain) => {
		expect(productOpenerCanonicalUrl(product, { country, language })).toBe(
			`https://${subdomain}.openfoodfacts.org/product/3017620422003`
		);
	});

	it('omits the canonical for non-food product types', () => {
		expect(
			productOpenerCanonicalUrl(
				{ ...product, product_type: 'beauty' },
				{
					country: 'world',
					language: 'en'
				}
			)
		).toBeUndefined();
	});
});

describe('Explorer product canonicals', () => {
	it('uses the API barcode for original and normalized requests', () => {
		const normalized = '0012345678905';
		const original = '12345678905';
		const result = (barcode: string) =>
			productSeo(
				{ code: normalized },
				new URL(`https://preview.example.org/world-en/products/${barcode}`),
				barcode
			).canonicalUrl;

		expect(result(original)).toBe(`https://explorer.example.org/world-en/products/${normalized}`);
		expect(result(normalized)).toBe(result(original));
	});

	it('falls back to the request barcode if the product has no code', () => {
		const url = new URL('https://preview.example.org/world-en/products/12345678905');
		expect(productSeo({}, url, '12345678905').canonicalUrl).toBe(
			'https://explorer.example.org/world-en/products/12345678905'
		);
	});
});
