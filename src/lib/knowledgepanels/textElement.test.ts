import { describe, expect, it } from 'vitest';
import { extractSingleListLink } from './textElement';

describe('extractSingleListLink', () => {
	it('extracts a single CTA list link used in KP text blocks', () => {
		const html =
			"<ul><li><p><a href='https://hunger.openfoodfacts.org/questions?type=category&value_tag=en%3Acocoa-and-its-products'><em>Answer robotoff questions about category en:cocoa-and-its-products</em></a></p></li></ul>";

		expect(extractSingleListLink(html)).toEqual({
			href: 'https://hunger.openfoodfacts.org/questions?type=category&value_tag=en%3Acocoa-and-its-products',
			label: 'Answer robotoff questions about category en:cocoa-and-its-products'
		});
	});

	it('returns null when there is additional content around the link', () => {
		const html = "<ul><li><p>Before <a href='https://example.org'>click</a> after</p></li></ul>";

		expect(extractSingleListLink(html)).toBeNull();
	});

	it('returns null when there are multiple links', () => {
		const html =
			"<ul><li><a href='https://example.org/a'>A</a></li><li><a href='https://example.org/b'>B</a></li></ul>";

		expect(extractSingleListLink(html)).toBeNull();
	});
});
