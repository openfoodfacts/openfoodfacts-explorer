import { describe, expect, it } from 'vitest';

import { createPhotoTextSnapshot, findPhotoTextMismatches } from './photoTextMismatch';

const baseProduct = {
	images: {
		ingredients_fr: { imgid: '1', rev: '5' },
		nutrition_fr: { imgid: '2', rev: '6' },
		front_fr: { imgid: '3', rev: '7' }
	},
	ingredients_text_fr: 'sucre, farine',
	nutriments: { sugars_100g: 10, fat_100g: 2 }
};

describe('findPhotoTextMismatches', () => {
	it('returns nothing when no photo changed', () => {
		const snapshot = createPhotoTextSnapshot(baseProduct);
		expect(findPhotoTextMismatches(snapshot, baseProduct.images, baseProduct)).toEqual([]);
	});

	it('flags an ingredients photo change without text update', () => {
		const snapshot = createPhotoTextSnapshot(baseProduct);
		const images = { ...baseProduct.images, ingredients_fr: { imgid: '4', rev: '8' } };
		expect(findPhotoTextMismatches(snapshot, images, baseProduct)).toEqual([
			{ type: 'ingredients', lang: 'fr' }
		]);
	});

	it('does not flag an ingredients photo change when the text was updated', () => {
		const snapshot = createPhotoTextSnapshot(baseProduct);
		const images = { ...baseProduct.images, ingredients_fr: { imgid: '4', rev: '8' } };
		const edited = { ...baseProduct, ingredients_text_fr: 'sucre, farine, sel' };
		expect(findPhotoTextMismatches(snapshot, images, edited)).toEqual([]);
	});

	it('ignores whitespace-only changes to the ingredients text', () => {
		const snapshot = createPhotoTextSnapshot(baseProduct);
		const images = { ...baseProduct.images, ingredients_fr: { imgid: '1', rev: '9' } };
		const edited = { ...baseProduct, ingredients_text_fr: 'sucre, farine  ' };
		expect(findPhotoTextMismatches(snapshot, images, edited)).toEqual([
			{ type: 'ingredients', lang: 'fr' }
		]);
	});

	it('flags a newly added photo for a language without text', () => {
		const snapshot = createPhotoTextSnapshot(baseProduct);
		const images = { ...baseProduct.images, ingredients_en: { imgid: '5', rev: '10' } };
		expect(findPhotoTextMismatches(snapshot, images, baseProduct)).toEqual([
			{ type: 'ingredients', lang: 'en' }
		]);
	});

	it('flags a nutrition photo change without nutrition update', () => {
		const snapshot = createPhotoTextSnapshot(baseProduct);
		const images = { ...baseProduct.images, nutrition_fr: { imgid: '2', rev: '11' } };
		expect(findPhotoTextMismatches(snapshot, images, baseProduct)).toEqual([
			{ type: 'nutrition', lang: 'fr' }
		]);
	});

	it('does not flag a nutrition photo change when nutrition values were updated', () => {
		const snapshot = createPhotoTextSnapshot(baseProduct);
		const images = { ...baseProduct.images, nutrition_fr: { imgid: '2', rev: '11' } };
		const edited = { ...baseProduct, nutriments: { sugars_100g: 12, fat_100g: 2 } };
		expect(findPhotoTextMismatches(snapshot, images, edited)).toEqual([]);
	});

	it('ignores removed photos and other photo types', () => {
		const snapshot = createPhotoTextSnapshot(baseProduct);
		const images = { nutrition_fr: baseProduct.images.nutrition_fr, front_fr: { imgid: '9' } };
		expect(findPhotoTextMismatches(snapshot, images, baseProduct)).toEqual([]);
	});
});
