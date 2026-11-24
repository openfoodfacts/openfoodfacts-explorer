import { describe, expect, it, vi } from 'vitest';
import { load } from './+page';
import { PRO_PLATFORM_URL } from '#lib/const.js';

vi.mock('#lib/api/staticPages.js', () => ({
	getStaticPageContent: vi.fn().mockResolvedValue('<h1>Mock content</h1>'),
	getStaticPageUrl: vi.fn(
		(id: string, language: string) =>
			new URL(`https://world.openfoodfacts.org/${id}?lang=${language}`)
	)
}));

describe('static page load', () => {
	it('redirects producers to the Pro platform', async () => {
		const event = {
			fetch: vi.fn(),
			params: { id: 'producers' },
			url: new URL('https://example.com/static/producers')
		};

		await expect(load(event as never)).rejects.toMatchObject({
			status: 301,
			location: PRO_PLATFORM_URL
		});
	});

	it('redirects main site pages to the main site', async () => {
		const event = {
			fetch: vi.fn(),
			params: { id: 'faq' },
			url: new URL('https://example.com/static/faq')
		};

		await expect(load(event as never)).rejects.toMatchObject({
			status: 307
		});
	});

	it('loads content for native static pages', async () => {
		const event = {
			fetch: vi.fn(),
			params: { id: 'discover' },
			url: new URL('https://example.com/static/discover')
		};

		const result = await load(event as never);
		expect(result).toMatchObject({
			content: '<h1>Mock content</h1>'
		});
	});

	it('returns null content for unknown pages', async () => {
		const event = {
			fetch: vi.fn(),
			params: { id: 'non-existent-page' },
			url: new URL('https://example.com/static/non-existent-page')
		};

		const result = await load(event as never);
		expect(result).toMatchObject({
			content: null
		});
	});
});
