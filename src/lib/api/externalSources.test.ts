import { describe, expect, it, vi } from 'vitest';
import {
	expandExternalSourceUrl,
	getExternalKnowledgePanels,
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

	it('accepts the panels response returned by external providers', async () => {
		const externalSource = source();
		const fetch = vi.fn(async (input: RequestInfo | URL) => {
			const url = input instanceof Request ? input.url : String(input);
			if (url.includes('/api/v3/external_sources')) {
				return Response.json({ external_sources: [externalSource] });
			}

			return Response.json({
				panels: {
					root: {
						elements: [],
						type: 'root'
					}
				}
			});
		});

		const results = await getExternalKnowledgePanels(fetch, {
			code: '5000326011242',
			lc: 'en',
			cc: 'world',
			productType: 'food',
			categories: ['en:eggs']
		});

		expect(results).toHaveLength(1);
		expect(results[0].knowledgePanels).toHaveProperty('root');
	});
});
