import { describe, expect, it, vi } from 'vitest';
import { sanitize } from 'isomorphic-dompurify';
import {
	extractStaticPageContent,
	getStaticPageContent,
	makeSiteRelativeUrlsAbsolute
} from './staticPages';

const staticPageHtml = `<html><body>
	<div id="barcode-scanner-modal"><button>Scan</button></div>
	<div id="main_column">
		<style>.row { display: none; }</style>
		<h1 class="if-empty-dnone"></h1>
		<h1>Privacy</h1>
		<p>&nbsp;</p>
		<p><img src="/images/banner.png" alt="Banner"></p>
		<p><img src="images/relative.png" alt="Relative image"></p>
		<table><tr><td>Cookies</td></tr></table>
		<a href="/terms-of-use">Terms</a>
		<a href="related-page">Related page</a>
		<a href="#contact">Contact</a>
		<a href="https://blog.openfoodfacts.org/">Blog</a>
		<a href="/contribute" class="button round">Join us</a>
		<img src="/images/logo.svg" alt="Logo">
		<img src="https://blog.openfoodfacts.org/photo.png" alt="Photo">
		<script>alert(1)</script>
	</div>
	<script src="https://static.openfoodfacts.org/js/dist/jquery.js"></script>
</body></html>`;

function createContentElement(html: string): Element {
	const body = sanitize(`<div id="content">${html}</div>`, {
		USE_PROFILES: { html: true },
		RETURN_DOM: true
	}) as HTMLElement;
	return body.querySelector('#content')!;
}

describe('makeSiteRelativeUrlsAbsolute', () => {
	it('rebases root-relative and page-relative URLs against the source page', () => {
		const content = createContentElement(
			'<a href="/terms-of-use">Terms</a><a href="related-page">Related</a><img src="images/photo.png">'
		);

		makeSiteRelativeUrlsAbsolute(
			content,
			'https://world.openfoodfacts.org/about/privacy?content_only=1'
		);

		expect(
			content.querySelector('a[href="https://world.openfoodfacts.org/terms-of-use"]')
		).not.toBeNull();
		expect(
			content.querySelector('a[href="https://world.openfoodfacts.org/about/related-page"]')
		).not.toBeNull();
		expect(
			content.querySelector('img[src="https://world.openfoodfacts.org/about/images/photo.png"]')
		).not.toBeNull();
	});

	it('preserves fragment-only and absolute URLs', () => {
		const content = createContentElement(
			'<a href="#contact">Contact</a><a href="https://blog.openfoodfacts.org/post">Blog</a><img src="//cdn.example.org/photo.png">'
		);

		makeSiteRelativeUrlsAbsolute(content, 'https://world.openfoodfacts.org/about/privacy');

		expect(content.querySelector('a[href="#contact"]')).not.toBeNull();
		expect(content.querySelector('a[href="https://blog.openfoodfacts.org/post"]')).not.toBeNull();
		expect(content.querySelector('img[src="//cdn.example.org/photo.png"]')).not.toBeNull();
	});
});

describe('extractStaticPageContent', () => {
	const content =
		extractStaticPageContent(
			staticPageHtml,
			'https://world.openfoodfacts.org/about/privacy?content_only=1'
		) ?? '';

	it('keeps only the main column, without scripts or styles', () => {
		expect(content).toContain('<h1>Privacy</h1>');
		expect(content).toContain('<td>Cookies</td>');
		expect(content).not.toContain('Scan');
		expect(content).not.toContain('<script');
		expect(content).not.toContain('display: none');
	});

	it('rebases relative URLs against the source page and preserves fragments and absolute URLs', () => {
		expect(content).toContain('href="https://world.openfoodfacts.org/terms-of-use"');
		expect(content).toContain('href="https://world.openfoodfacts.org/about/related-page"');
		expect(content).toContain('href="#contact"');
		expect(content).toContain('href="https://blog.openfoodfacts.org/"');
		expect(content).toContain('src="https://world.openfoodfacts.org/images/logo.svg"');
		expect(content).toContain('src="https://world.openfoodfacts.org/about/images/relative.png"');
		expect(content).toContain('src="https://blog.openfoodfacts.org/photo.png"');
	});

	it('styles the main site button links as buttons', () => {
		const classes = content.match(/<a [^>]*class="([^"]*)"[^>]*>Join us/)?.[1].split(' ');
		expect(classes).toEqual(expect.arrayContaining(['btn', 'btn-primary']));
	});

	it('drops empty spacer paragraphs and titles but keeps an image-only paragraph', () => {
		expect(content).not.toContain('<h1 class="if-empty-dnone"></h1>');
		expect(content).not.toMatch(/<p>(&nbsp;|\s)*<\/p>/);
		expect(content).toContain('/images/banner.png');
	});

	it('returns null when the page has no main column', () => {
		expect(extractStaticPageContent('<p>Maintenance</p>')).toBeNull();
	});
});

describe('getStaticPageContent', () => {
	it('returns null when the main site fails or cannot be reached', async () => {
		const failing = vi.fn().mockResolvedValue(new Response(staticPageHtml, { status: 503 }));
		const unreachable = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
		const cutOff = vi
			.fn()
			.mockResolvedValue(
				new Response(new ReadableStream({ start: (stream) => stream.error(new Error('reset')) }))
			);
		expect(await getStaticPageContent(failing, 'privacy')).toBeNull();
		expect(await getStaticPageContent(unreachable, 'privacy')).toBeNull();
		expect(await getStaticPageContent(cutOff, 'privacy')).toBeNull();
	});

	it('returns the cleaned content of a page', async () => {
		const ok = vi.fn().mockResolvedValue(new Response(staticPageHtml));
		expect(await getStaticPageContent(ok, 'privacy')).toContain('<h1>Privacy</h1>');
	});
});
