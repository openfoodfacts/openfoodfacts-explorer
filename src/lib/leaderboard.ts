export type LeaderboardPosition =
	/** The exact position, counting the contributors with strictly more products. */
	| { kind: 'rank'; rank: number }
	/** Below the last contributor that was loaded. */
	| { kind: 'outside'; top: number };

/** Whether a list of counts is ordered from the highest to the lowest. */
export function isSortedDescending(counts: readonly number[]): boolean {
	return counts.every((count, index) => index === 0 || counts[index - 1] >= count);
}

/**
 * Find where a contributor stands, given the counts of the top contributors (highest first)
 * and their own count.
 *
 * Returns `null` when nothing reliable can be said: no contribution, no data, or a list
 * that is not ordered (so it cannot be trusted to be the top).
 */
export function getLeaderboardPosition(
	topCounts: readonly number[],
	userCount: number
): LeaderboardPosition | null {
	if (!Number.isFinite(userCount) || userCount <= 0) return null;
	if (topCounts.length === 0 || !isSortedDescending(topCounts)) return null;

	const lowestTop = topCounts[topCounts.length - 1];
	if (userCount < lowestTop) return { kind: 'outside', top: topCounts.length };

	const ahead = topCounts.filter((count) => count > userCount).length;
	return { kind: 'rank', rank: ahead + 1 };
}
