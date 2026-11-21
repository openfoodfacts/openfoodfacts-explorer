import { describe, expect, it } from 'vitest';
import { getLeaderboardPosition, isSortedDescending } from './leaderboard.js';

const TOP = [900, 500, 500, 120, 40];

describe('isSortedDescending', () => {
	it('accepts descending lists, ties included', () => {
		expect(isSortedDescending(TOP)).toBe(true);
		expect(isSortedDescending([])).toBe(true);
		expect(isSortedDescending([7])).toBe(true);
	});

	it('rejects lists that go back up', () => {
		expect(isSortedDescending([10, 20, 5])).toBe(false);
	});
});

describe('getLeaderboardPosition', () => {
	it('puts the leader first', () => {
		expect(getLeaderboardPosition(TOP, 900)).toEqual({ kind: 'rank', rank: 1 });
		expect(getLeaderboardPosition(TOP, 5000)).toEqual({ kind: 'rank', rank: 1 });
	});

	it('counts only contributors with strictly more products', () => {
		// Two contributors have 500, so a user with 500 is behind only the leader.
		expect(getLeaderboardPosition(TOP, 500)).toEqual({ kind: 'rank', rank: 2 });
		expect(getLeaderboardPosition(TOP, 120)).toEqual({ kind: 'rank', rank: 4 });
	});

	it('gives the last position of the list when the count equals the lowest one', () => {
		expect(getLeaderboardPosition(TOP, 40)).toEqual({ kind: 'rank', rank: 5 });
	});

	it('says the user is outside the list when below its last count', () => {
		expect(getLeaderboardPosition(TOP, 39)).toEqual({ kind: 'outside', top: TOP.length });
	});

	it('says nothing without contributions or data', () => {
		expect(getLeaderboardPosition(TOP, 0)).toBeNull();
		expect(getLeaderboardPosition(TOP, Number.NaN)).toBeNull();
		expect(getLeaderboardPosition([], 10)).toBeNull();
	});

	it('does not trust a list that is not sorted', () => {
		expect(getLeaderboardPosition([10, 90, 50], 60)).toBeNull();
	});
});
