import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import HtmlPurify from './ui/HtmlPurify.svelte';

describe('HtmlPurify security regression suite', () => {
	test('removes <script> tags', () => {
		const { container } = render(HtmlPurify, {
			props: { dirty: '<script>alert("xss")</script><b>safe</b>' }
		});
		expect(container.innerHTML).toContain('<b>safe</b>');
		expect(container.innerHTML).not.toContain('<script>');
	});

	test('strips inline event handlers', () => {
		const { container } = render(HtmlPurify, {
			props: { dirty: '<img src="x" onerror="alert(1)" />' }
		});
		expect(container.innerHTML).toContain('<img src="x">');
		expect(container.innerHTML).not.toContain('onerror');
	});

	test('preserves safe formatting tags', () => {
		const { container } = render(HtmlPurify, { props: { dirty: '<i>italic</i>' } });
		expect(container.innerHTML).toContain('<i>italic</i>');
	});

	test('removes javascript: URLs', () => {
		const { container } = render(HtmlPurify, {
			props: { dirty: '<a href="javascript:alert(1)">click</a>' }
		});
		expect(container.innerHTML).toContain('<a>click</a>');
		expect(container.innerHTML).not.toContain('javascript:');
	});

	test('handles malformed script tags', () => {
		const { container } = render(HtmlPurify, {
			props: { dirty: '<scr<script>ipt>alert(1)</scr<script>ipt>' }
		});
		expect(container.innerHTML).not.toContain('alert');
	});

	test('strips dangerous CSS expressions', () => {
		const { container } = render(HtmlPurify, {
			props: { dirty: '<div style="background:url(javascript:alert(1))">safe</div>' }
		});
		expect(container.innerHTML).toContain('safe');
		expect(container.innerHTML).not.toContain('javascript:');
	});

	test('removes script inside SVG', () => {
		const { container } = render(HtmlPurify, {
			props: { dirty: '<svg><script>alert(1)</script></svg>' }
		});
		expect(container.innerHTML).not.toContain('<script>');
	});

	test('neutralizes encoded XSS payloads', () => {
		const { container } = render(HtmlPurify, {
			props: { dirty: '<img src="x" onerror="&#97;&#108;&#101;&#114;&#116;(1)" />' }
		});
		expect(container.innerHTML).toContain('<img src="x">');
		expect(container.innerHTML).not.toContain('onerror');
	});
});
