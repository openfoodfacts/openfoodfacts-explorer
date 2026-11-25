export type ContributionKind = 'contributor' | 'editor' | 'photographer';

/** Steps every kind of contribution has at least, so there is always something close to reach. */
export const BASE_SCALE = [1, 10, 20, 50, 100, 200, 500, 750, 1000] as const;

/**
 * Contribution counts that unlock a badge, in ascending order, per kind of contribution.
 *
 * Each scale includes the shared base steps, plus the higher steps calibrated on
 * the most active human contributors. Accounts that represent apps, importers or
 * organisations are far above these values by design.
 */
export const MILESTONES_BY_KIND = {
	// Calibrated on the contributors facet: ~1000 is around the 100th of ~49k accounts.
	// 75 sits between the base steps, so the scale is written out in full.
	contributor: [1, 10, 20, 50, 75, 100, 200, 500, 750, 1000, 5000, 10000, 25000],
	// Calibrated on the Query API: the 50th editor has ~22k edits and the most active
	// human editors are between ~35k and ~90k.
	editor: [...BASE_SCALE, 5000, 10000, 50000, 75000],
	// Calibrated on the Query API: the 50th photographer has ~2.5k photos, 5000 is
	// around the 27th and 10000 around the 18th.
	photographer: [...BASE_SCALE, 2000, 5000, 7000, 10000]
} as const satisfies Record<ContributionKind, readonly number[]>;

export type MilestoneProgress = {
	/** Milestones already reached. */
	unlocked: number[];
	/** The next milestone to reach, or `null` once the last one is unlocked. */
	next: number | null;
	/** How many more contributions are needed to reach `next` (0 when there is none). */
	remaining: number;
	/** Progress from the last unlocked milestone to `next`, between 0 and 1. */
	ratio: number;
};

/** Compute which milestones a contribution count has unlocked and how far the next one is. */
export function getMilestoneProgress(
	count: number,
	milestones: readonly number[]
): MilestoneProgress {
	const safeCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;

	const unlocked = milestones.filter((milestone) => safeCount >= milestone);
	const next = milestones.find((milestone) => safeCount < milestone) ?? null;

	if (next === null) {
		return { unlocked, next, remaining: 0, ratio: 1 };
	}

	const previous = unlocked.at(-1) ?? 0;
	const ratio = (safeCount - previous) / (next - previous);

	return { unlocked, next, remaining: next - safeCount, ratio };
}

/** Total number of badges that can be unlocked across every kind of contribution. */
export const TOTAL_BADGES = Object.values(MILESTONES_BY_KIND).reduce(
	(total, scale) => total + scale.length,
	0
);

/** Count the badges unlocked across every kind of contribution. */
export function countUnlockedBadges(counts: Record<ContributionKind, number>): number {
	return (Object.keys(MILESTONES_BY_KIND) as ContributionKind[]).reduce(
		(total, kind) =>
			total + getMilestoneProgress(counts[kind], MILESTONES_BY_KIND[kind]).unlocked.length,
		0
	);
}

/**
 * Fun titles earned by unlocking badges, in ascending order.
 * `fallback` is the English text used when the translation is missing.
 */
export const LEVELS = [
	{ key: 'rookie', minBadges: 0, fallback: 'Pantry Rookie' },
	{ key: 'reader', minBadges: 1, fallback: 'Label Reader' },
	{ key: 'hunter', minBadges: 8, fallback: 'Barcode Hunter' },
	{ key: 'detective', minBadges: 16, fallback: 'Food Detective' },
	{ key: 'legend', minBadges: 27, fallback: 'Open Legend' }
] as const;

/** The highest level reached with the given number of unlocked badges. */
export function getContributorLevel(unlockedBadges: number): (typeof LEVELS)[number] {
	const safe = Number.isFinite(unlockedBadges) ? unlockedBadges : 0;
	return LEVELS.findLast((level) => safe >= level.minBadges) ?? LEVELS[0];
}
