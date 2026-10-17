import { describe, expect, it, vi } from 'vitest';
import { extractStaticPageContent, getStaticPageContent } from './staticPages';

const page = `<html><body>
	<div id="barcode-scanner-modal"><button>Scan</button></div>
	<div id="main_column">
		<style>.row { display: none; }</style>
		<h1 class="if-empty-dnone"></h1>
		<h1>Privacy</h1>
		<p>&nbsp;</p>
		<p><img src="/images/banner.png" alt="Banner"></p>
		<table><tr><td>Cookies</td></tr></table>
		<a href="/terms-of-use">Terms</a>
		<a href="#contact">Contact</a>
		<a href="https://blog.openfoodfacts.org/">Blog</a>
		<a href="/contribute" class="button round">Join us</a>
		<img src="/images/logo.svg" alt="Logo">
		<img src="https://blog.openfoodfacts.org/photo.png" alt="Photo">
		<script>alert(1)</script>
	</div>
	<script src="https://static.openfoodfacts.org/js/dist/jquery.js"></script>
</body></html>`;

describe('extractStaticPageContent', () => {
	const content = extractStaticPageContent(page) ?? '';

	it('keeps only the main column, without scripts or styles', () => {
		expect(content).toContain('<h1>Privacy</h1>');
		expect(content).toContain('<td>Cookies</td>');
		expect(content).not.toContain('Scan');
		expect(content).not.toContain('<script');
		expect(content).not.toContain('display: none');
	});

	it('points site-relative links and images to the main site and leaves the others alone', () => {
		expect(content).toContain('href="https://world.openfoodfacts.org/terms-of-use"');
		expect(content).toContain('href="#contact"');
		expect(content).toContain('href="https://blog.openfoodfacts.org/"');
		expect(content).toContain('src="https://world.openfoodfacts.org/images/logo.svg"');
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
		const failing = vi.fn().mockResolvedValue(new Response(page, { status: 503 }));
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
		const ok = vi.fn().mockResolvedValue(new Response(page));
		expect(await getStaticPageContent(ok, 'privacy')).toContain('<h1>Privacy</h1>');
	});
});
