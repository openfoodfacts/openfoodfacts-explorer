import { describe, expect, it } from 'vitest';
import {
	BASE_SCALE,
	countUnlockedBadges,
	getContributorLevel,
	getMilestoneProgress,
	LEVELS,
	MILESTONES_BY_KIND,
	TOTAL_BADGES
} from './milestones.js';

const SCALE = [1, 10, 100, 1000] as const;

describe('getMilestoneProgress', () => {
	it('unlocks nothing and aims for the first milestone at zero', () => {
		expect(getMilestoneProgress(0, SCALE)).toEqual({
			unlocked: [],
			next: 1,
			remaining: 1,
			ratio: 0
		});
	});

	it('unlocks a milestone exactly when the count reaches it', () => {
		expect(getMilestoneProgress(1, SCALE).unlocked).toEqual([1]);
		expect(getMilestoneProgress(9, SCALE).unlocked).toEqual([1]);
		expect(getMilestoneProgress(10, SCALE).unlocked).toEqual([1, 10]);
	});

	it('measures progress between the last unlocked milestone and the next one', () => {
		// 55 is halfway between 10 and 100.
		expect(getMilestoneProgress(55, SCALE)).toEqual({
			unlocked: [1, 10],
			next: 100,
			remaining: 45,
			ratio: 0.5
		});
	});

	it('reports full progress once every milestone is unlocked', () => {
		expect(getMilestoneProgress(1500, SCALE)).toEqual({
			unlocked: [...SCALE],
			next: null,
			remaining: 0,
			ratio: 1
		});
	});

	it('treats invalid counts as zero', () => {
		expect(getMilestoneProgress(-5, SCALE).unlocked).toEqual([]);
		expect(getMilestoneProgress(Number.NaN, SCALE).next).toBe(1);
	});
});

describe('MILESTONES_BY_KIND', () => {
	it.each(Object.entries(MILESTONES_BY_KIND))(
		'has a strictly ascending scale for %s',
		(_, scale) => {
			expect(scale.length).toBeGreaterThan(0);
			for (let i = 1; i < scale.length; i++) {
				expect(scale[i]).toBeGreaterThan(scale[i - 1]);
			}
		}
	);
});

describe('countUnlockedBadges', () => {
	it('counts nothing for a brand new contributor', () => {
		expect(countUnlockedBadges({ contributor: 0, editor: 0, photographer: 0 })).toBe(0);
	});

	it('sums the badges unlocked in every kind', () => {
		// 1 and 10 for contributor, 1 for editor, nothing for photographer.
		expect(countUnlockedBadges({ contributor: 10, editor: 1, photographer: 0 })).toBe(3);
	});

	it('reaches the total once every scale is complete', () => {
		expect(countUnlockedBadges({ contributor: 1e9, editor: 1e9, photographer: 1e9 })).toBe(
			TOTAL_BADGES
		);
	});
});

describe('getContributorLevel', () => {
	it('starts at the first level', () => {
		expect(getContributorLevel(0).key).toBe(LEVELS[0].key);
	});

	it('moves up exactly at each level threshold', () => {
		for (const level of LEVELS) {
			expect(getContributorLevel(level.minBadges).key).toBe(level.key);
		}
		expect(getContributorLevel(LEVELS[2].minBadges - 1).key).toBe(LEVELS[1].key);
	});

	it('caps at the last level', () => {
		expect(getContributorLevel(TOTAL_BADGES).key).toBe(LEVELS[LEVELS.length - 1].key);
	});

	it('only needs thresholds the scales can actually reach', () => {
		expect(LEVELS[LEVELS.length - 1].minBadges).toBeLessThanOrEqual(TOTAL_BADGES);
	});
});

describe('badge scale', () => {
	it('always includes the shared base steps', () => {
		for (const scale of Object.values(MILESTONES_BY_KIND)) {
			for (const step of BASE_SCALE) {
				expect(scale).toContain(step);
			}
		}
		expect([...BASE_SCALE]).toEqual([1, 10, 20, 50, 100, 200, 500, 750, 1000]);
	});

	it('keeps the calibrated maximum of each kind', () => {
		expect(MILESTONES_BY_KIND.contributor.at(-1)).toBe(25000);
		expect(MILESTONES_BY_KIND.editor.at(-1)).toBe(75000);
		expect(MILESTONES_BY_KIND.photographer.at(-1)).toBe(10000);
		expect(TOTAL_BADGES).toBe(39);
	});
});
