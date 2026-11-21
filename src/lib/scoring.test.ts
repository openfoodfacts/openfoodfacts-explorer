import { describe, expect, it } from 'vitest';
import { getMismatchedAttributes } from './scoring';
import type { UserPreference } from '#lib/stores/preferencesStore.js';

const pref = (attributeId: string, value: string): UserPreference => ({
	type: 'attribute',
	groupId: 'labels',
	attributeId,
	value
});

describe('getMismatchedAttributes', () => {
	const groups = [
		{
			id: 'labels',
			attributes: [
				{ id: 'vegan', match: 0, status: 'known' },
				{ id: 'palm_oil_free', match: 10, status: 'known' },
				{ id: 'organic', match: 11, status: 'known' },
				{ id: 'fair_trade', match: 0, status: 'unknown' },
				{ id: 'no_gluten', match: 0, status: 'known' }
			]
		}
	];

	it('returns known attributes at or below the mismatch match for important preferences', () => {
		const prefs = [
			pref('vegan', 'mandatory'),
			pref('palm_oil_free', 'important'),
			pref('organic', 'very_important'),
			pref('fair_trade', 'important'),
			pref('no_gluten', 'not_important')
		];
		expect(getMismatchedAttributes(groups, prefs).map((a) => a.id)).toEqual([
			'vegan',
			'palm_oil_free'
		]);
	});

	it('ignores attributes without a preference', () => {
		expect(getMismatchedAttributes(groups, [])).toEqual([]);
	});
});
