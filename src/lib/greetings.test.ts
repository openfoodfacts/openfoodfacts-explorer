import { describe, expect, it } from 'vitest';
import {
	getGreetingPeriod,
	GREETINGS,
	pickGreeting,
	seededRandom,
	WEEKDAY_GREETINGS
} from './greetings.js';

describe('getGreetingPeriod', () => {
	it.each([
		[0, 'night'],
		[4, 'night'],
		[5, 'morning'],
		[11, 'morning'],
		[12, 'afternoon'],
		[17, 'afternoon'],
		[18, 'evening'],
		[21, 'evening'],
		[22, 'night'],
		[23, 'night']
	] as const)('maps %i o clock to %s', (hour, period) => {
		expect(getGreetingPeriod(hour)).toBe(period);
	});
});

describe('GREETINGS', () => {
	it('has several greetings per period, each mentioning the user', () => {
		for (const options of Object.values(GREETINGS)) {
			expect(options.length).toBeGreaterThan(1);
			for (const { fallback } of options) {
				expect(fallback).toContain('{user}');
			}
		}
	});

	it('uses unique keys, weekday greetings included', () => {
		const all = [...Object.values(GREETINGS), ...Object.values(WEEKDAY_GREETINGS)];
		const keys = all.flatMap((options) => options!.map(({ key }) => key));
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('mentions the user in the weekday greetings too', () => {
		for (const options of Object.values(WEEKDAY_GREETINGS)) {
			for (const { fallback } of options!) {
				expect(fallback).toContain('{user}');
			}
		}
	});
});

describe('pickGreeting', () => {
	it('picks from the period of the given hour', () => {
		expect(pickGreeting(23, () => 0).key).toBe('landing.greetings.night_1');
		expect(pickGreeting(8, () => 0).key).toBe('landing.greetings.morning_1');
	});

	it('uses the whole pool, including the last entry', () => {
		const last = GREETINGS.evening[GREETINGS.evening.length - 1];
		expect(pickGreeting(19, () => 0.999).key).toBe(`landing.greetings.${last.key}`);
	});

	it('never goes out of range when random returns 1', () => {
		expect(() => pickGreeting(13, () => 1)).not.toThrow();
	});
});

describe('seededRandom', () => {
	it('gives the same sequence for the same seed', () => {
		const first = seededRandom('2026-11-21|night|someone');
		const second = seededRandom('2026-11-21|night|someone');

		expect([first(), first(), first()]).toEqual([second(), second(), second()]);
	});

	it('stays within [0, 1)', () => {
		const random = seededRandom('range');
		for (let i = 0; i < 1000; i++) {
			const value = random();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		}
	});

	it('spreads different seeds over the whole pool of greetings', () => {
		const picked = new Set<string>();
		for (let day = 1; day <= 200; day++) {
			picked.add(pickGreeting(8, seededRandom(`day-${day}|morning|user`)).key);
		}
		expect(picked.size).toBe(GREETINGS.morning.length);
	});

	it('keeps the greeting stable across reloads with the same seed', () => {
		const seed = 'Sat Nov 21 2026|evening|someone';

		expect(pickGreeting(19, seededRandom(seed))).toEqual(pickGreeting(19, seededRandom(seed)));
	});
});

describe('weekday greetings', () => {
	const MONDAY = 1;
	const TUESDAY = 2;

	it('prefers the greetings of the day when the random source says so', () => {
		expect(pickGreeting(8, () => 0, MONDAY).key).toBe('landing.greetings.monday_1');
	});

	it('falls back to the time of day the rest of the time', () => {
		// 0.9 is above the chance of a weekday greeting, so the morning pool is used.
		const last = GREETINGS.morning[GREETINGS.morning.length - 1];
		expect(pickGreeting(8, () => 0.9, MONDAY).key).toBe(`landing.greetings.${last.key}`);
	});

	it('only uses the time of day on days without greetings of their own', () => {
		for (let seed = 0; seed < 50; seed++) {
			const { key } = pickGreeting(8, seededRandom(`s${seed}`), TUESDAY);
			expect(key).toMatch(/landing\.greetings\.morning_/);
		}
	});

	it('mixes both kinds on a day that has its own greetings', () => {
		const keys = new Set<string>();
		for (let seed = 0; seed < 100; seed++) {
			keys.add(
				pickGreeting(8, seededRandom(`s${seed}`), MONDAY)
					.key.split('.')
					.at(-1)!
					.split('_')[0]
			);
		}
		expect(keys).toEqual(new Set(['monday', 'morning']));
	});

	it('is unchanged when no weekday is given', () => {
		expect(pickGreeting(23, () => 0).key).toBe('landing.greetings.night_1');
	});
});
