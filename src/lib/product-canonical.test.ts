import { describe, expect, it } from 'vitest';
import { productOpenerCanonicalUrl } from './product-canonical.js';

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
