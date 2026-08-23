import { describe, expect, it } from 'vitest';
import {
	expandExternalSourceUrl,
	isExternalSourceEligible,
	type ExternalSource
} from './externalSources';

const source = (overrides: Partial<ExternalSource> = {}): ExternalSource => ({
	id: 'source',
	name: 'Source',
	knowledge_panel_url: 'https://provider.example/$code?lang=$lc&country=$cc',
	section: 'external',
	scope: 'public',
	...overrides
});

describe('external knowledge panel sources', () => {
	it('expands and encodes all documented URL variables', () => {
		expect(
			expandExternalSourceUrl('https://example.test/$code/$lc/$cc', {
				code: '123/456',
				lc: 'en-US',
				cc: 'world wide'
			})
		).toBe('https://example.test/123%2F456/en-US/world%20wide');
	});

	it('matches category, country, language and product type filters', () => {
		expect(
			isExternalSourceEligible(
				source({
					filters: {
						categories: ['en:snacks'],
						countries: ['de'],
						languages: ['de'],
						product_types: ['food']
					}
				}),
				{
					cc: 'de',
					lc: 'de',
					productType: 'food',
					categories: ['en:snacks', 'en:foods']
				}
			)
		).toBe(true);

		expect(
			isExternalSourceEligible(source({ filters: { countries: ['fr'] } }), {
				cc: 'de',
				lc: 'de',
				productType: 'food',
				categories: []
			})
		).toBe(false);
	});

	it('does not expose private sources without an explicit scope grant', () => {
		const context = { cc: 'world', lc: 'en', categories: [] };
		expect(isExternalSourceEligible(source({ scope: 'moderators' }), context)).toBe(false);
		expect(
			isExternalSourceEligible(source({ scope: 'moderators', user_in_scope: true }), context)
		).toBe(true);
	});
});
