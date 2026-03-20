import { describe, it, expect } from 'vitest';
import HtmlPurify from './ui/HtmlPurify.svelte';
import { render } from '@testing-library/svelte';

describe('HtmlPurify security tests', () => {
	it('removes script tags', () => {
		const { container } = render(HtmlPurify, {
			props: { dirty: "<div>Hello<script>alert('XSS')</script></div>" }
		});
		expect(container.innerHTML).toBe('<div>Hello</div>');
	});

	it('strips event handlers', () => {
		const { container } = render(HtmlPurify, {
			props: { dirty: "<img src='x' onerror='alert(1)' />" }
		});
		expect(container.innerHTML).toBe('<img src="x">');
	});

	it('allows safe formatting tags', () => {
		const { container } = render(HtmlPurify, { props: { dirty: '<b>Bold</b> and <i>italic</i>' } });
		expect(container.innerHTML).toBe('<b>Bold</b> and <i>italic</i>');
	});
});
