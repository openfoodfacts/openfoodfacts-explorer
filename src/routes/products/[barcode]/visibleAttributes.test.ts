import { describe, expect, it } from 'vitest';
import { getVisibleAttributes } from './visibleAttributes.js';
import type { UserPreference } from '#lib/stores/preferencesStore.js';

const pref = (attributeId: string, value = 'important', groupId = 'labels'): UserPreference => ({
	type: 'attribute',
	groupId,
	attributeId,
	value
});

describe('getVisibleAttributes', () => {
	it('includes preferred attributes, puts poor matches first and unknowns last, and excludes tiles', () => {
		const groups = [
			{
				id: 'labels',
				attributes: [
					{ id: 'unknown', status: 'unknown' },
					{ id: 'good', status: 'known', match: 100 },
					{ id: 'bad', status: 'known', match: 0 },
					{ id: 'nutriscore', status: 'known', match: 0 },
					{ id: 'ignored', status: 'known', match: 0 },
					{ id: 'no_preference', status: 'known', match: 0 }
				]
			}
		];
		const preferences = ['unknown', 'good', 'bad', 'nutriscore'].map((id) => pref(id));
		preferences.push(pref('ignored', 'not_important'));
		expect(getVisibleAttributes(groups, preferences, ['nutriscore']).map((a) => a.id)).toEqual([
			'bad',
			'good',
			'unknown'
		]);
	});

	it('matches preferences by group as well as attribute id', () => {
		const groups = [{ id: 'labels', attributes: [{ id: 'vegan' }] }];
		expect(getVisibleAttributes(groups, [pref('vegan', 'important', 'other')], [])).toEqual([]);
	});
	it('puts mandatory preferences first while retaining match order within them', () => {
		const groups = [
			{
				id: 'labels',
				attributes: [
					{ id: 'bad', status: 'known', match: 0 },
					{ id: 'mandatory-good', status: 'known', match: 100 },
					{ id: 'mandatory-bad', status: 'known', match: 0 }
				]
			}
		];
		const preferences = [
			pref('bad'),
			pref('mandatory-good', 'mandatory'),
			pref('mandatory-bad', 'mandatory')
		];
		expect(getVisibleAttributes(groups, preferences, []).map((a) => a.id)).toEqual([
			'mandatory-bad',
			'mandatory-good',
			'bad'
		]);
	});
});
