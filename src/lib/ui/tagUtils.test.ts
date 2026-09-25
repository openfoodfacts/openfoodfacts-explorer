import { describe, expect, it } from 'vitest';
import { getTagMiniatureUrl } from './tagUtils';

describe('getTagMiniatureUrl', () => {
	it('returns undefined for empty/falsy inputs', () => {
		expect(getTagMiniatureUrl(null)).toBeUndefined();
		expect(getTagMiniatureUrl(undefined)).toBeUndefined();
		expect(getTagMiniatureUrl('')).toBeUndefined();
	});

	it('extracts URL from object properties', () => {
		expect(getTagMiniatureUrl({ icon_url: 'https://example.com/icon.svg' })).toBe(
			'https://example.com/icon.svg'
		);
		expect(getTagMiniatureUrl({ image_url: 'https://example.com/img.png' })).toBe(
			'https://example.com/img.png'
		);
		expect(getTagMiniatureUrl({ miniature: '/images/mini.png' })).toBe(
			'https://static.openfoodfacts.org/images/mini.png'
		);
		expect(getTagMiniatureUrl({ icon: 'dist/icon.svg' })).toBe(
			'https://static.openfoodfacts.org/dist/icon.svg'
		);
	});

	it('handles direct URL strings', () => {
		expect(getTagMiniatureUrl('https://example.com/logo.svg')).toBe('https://example.com/logo.svg');
		expect(getTagMiniatureUrl('/images/logo.svg')).toBe(
			'https://static.openfoodfacts.org/images/logo.svg'
		);
	});
});
