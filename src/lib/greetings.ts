export type GreetingPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

type Greeting = { key: string; fallback: string };

/** Which part of the day an hour (0-23) belongs to. */
export function getGreetingPeriod(hour: number): GreetingPeriod {
	if (hour >= 5 && hour < 12) return 'morning';
	if (hour >= 12 && hour < 18) return 'afternoon';
	if (hour >= 18 && hour < 22) return 'evening';
	return 'night';
}

/**
 * Playful greetings for the contributor dashboard, grouped by time of day.
 *
 * Every text contains `{user}`. `key` is the translation key under `landing.greetings.*`
 * and `fallback` is the English text. Avoid apostrophes so the keys can be synced to
 * the translation file with a simple script.
 */
export const GREETINGS: Record<GreetingPeriod, readonly Greeting[]> = {
	morning: [
		{ key: 'morning_1', fallback: 'Good morning, {user}' },
		{ key: 'morning_2', fallback: 'Rise and shine, {user}' },
		{ key: 'morning_3', fallback: 'Fresh start, {user}: breakfast labels await' },
		{ key: 'morning_4', fallback: 'Coffee first, then contributions, {user}?' }
	],
	afternoon: [
		{ key: 'afternoon_1', fallback: 'Good afternoon, {user}' },
		{ key: 'afternoon_2', fallback: 'Lunchtime label check, {user}?' },
		{ key: 'afternoon_3', fallback: 'Welcome back, {user}' },
		{ key: 'afternoon_4', fallback: 'Snack o clock, {user}' }
	],
	evening: [
		{ key: 'evening_1', fallback: 'Good evening, {user}' },
		{ key: 'evening_2', fallback: 'Dinner plans, {user}?' },
		{ key: 'evening_3', fallback: 'Cozy contributing time, {user}' },
		{ key: 'evening_4', fallback: 'Welcome back, {user}' }
	],
	night: [
		{ key: 'night_1', fallback: 'Moonlit contributing, {user}' },
		{ key: 'night_2', fallback: 'Burning the midnight oil, {user}?' },
		{ key: 'night_3', fallback: 'Night owl mode on, {user}' },
		{ key: 'night_4', fallback: 'Still up, {user}? Welcome back' }
	]
};

/**
 * Extra greetings for some days of the week (0 is Sunday, like `Date.getDay()`).
 * They are mixed in with the time-of-day greetings, see {@link WEEKDAY_CHANCE}.
 * Days that are not listed only use the time-of-day greetings.
 */
export const WEEKDAY_GREETINGS: Partial<Record<number, readonly Greeting[]>> = {
	0: [
		{ key: 'sunday_1', fallback: 'Slow Sunday, {user}: perfect for a few edits' },
		{ key: 'sunday_2', fallback: 'Sunday brunch, {user}: a quick look at the labels?' }
	],
	1: [
		{ key: 'monday_1', fallback: 'Happy Monday, {user}: fresh week, fresh labels' },
		{ key: 'monday_2', fallback: 'Monday again, {user}? Let us make it a good one' }
	],
	3: [{ key: 'wednesday_1', fallback: 'Midweek check-in, {user}: how is it going?' }],
	5: [
		{ key: 'friday_1', fallback: 'Happy Friday, {user}' },
		{ key: 'friday_2', fallback: 'Friday feeling, {user}: one more product before the weekend?' }
	],
	6: [
		{ key: 'saturday_1', fallback: 'Weekend vibes, {user}' },
		{ key: 'saturday_2', fallback: 'Saturday contributions, {user}: the best kind' }
	]
};

/** How often a day-specific greeting is preferred, on the days that have some. */
const WEEKDAY_CHANCE = 0.5;

/**
 * Pick a greeting for the given hour, and for the given day of the week when it has some
 * of its own. `random` is injectable to keep it testable.
 */
export function pickGreeting(hour: number, random: () => number = Math.random, weekday?: number) {
	const weekdayOptions = weekday === undefined ? undefined : WEEKDAY_GREETINGS[weekday];
	const options =
		weekdayOptions && random() < WEEKDAY_CHANCE
			? weekdayOptions
			: GREETINGS[getGreetingPeriod(hour)];
	const entry = options[Math.min(options.length - 1, Math.floor(random() * options.length))];
	return { key: `landing.greetings.${entry.key}`, fallback: entry.fallback };
}

/**
 * A small deterministic random number generator: the same seed always gives the same
 * sequence, with values in [0, 1). It lets a greeting look random but stay stable
 * across page reloads.
 */
export function seededRandom(seed: string): () => number {
	// FNV-1a hash of the seed.
	let hash = 2166136261;
	for (let i = 0; i < seed.length; i++) {
		hash ^= seed.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}

	// mulberry32, started from the hash.
	let state = hash >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
