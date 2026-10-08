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
		expect(getTagMiniatureUrl('http://example.com/logo.svg')).toBe('https://example.com/logo.svg');
		expect(getTagMiniatureUrl('//static.openfoodfacts.org/images/logo.svg')).toBe(
			'https://static.openfoodfacts.org/images/logo.svg'
		);
		expect(getTagMiniatureUrl('/images/logo.svg')).toBe(
			'https://static.openfoodfacts.org/images/logo.svg'
		);
	});

	it('resolves tag ID slugs with language prefixes', () => {
		expect(getTagMiniatureUrl('en:organic')).toBe(
			'https://static.openfoodfacts.org/images/icons/dist/organic.svg'
		);
		expect(getTagMiniatureUrl({ id: 'en:vegan' })).toBe(
			'https://static.openfoodfacts.org/images/icons/dist/vegan.svg'
		);
		expect(getTagMiniatureUrl({ key: 'fr:bio' })).toBe(
			'https://static.openfoodfacts.org/images/icons/dist/bio.svg'
		);
	});

	it('returns undefined for non-slugs, pure numeric codes, and arrays', () => {
		expect(getTagMiniatureUrl('3017620422003')).toBeUndefined();
		expect(getTagMiniatureUrl({ id: '123456' })).toBeUndefined();
		expect(getTagMiniatureUrl([])).toBeUndefined();
		expect(getTagMiniatureUrl(['en:organic'])).toBeUndefined();
		expect(getTagMiniatureUrl('---')).toBeUndefined();
	});
});
