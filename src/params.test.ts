import { describe, expect, it } from 'vitest';
import { isDrilldownPath } from './params';

describe('isDrilldownPath', () => {
	it.each(['categories', 'labels/en:organic/categories'])('matches %s', (param) => {
		expect(isDrilldownPath(param)).toBe(true);
	});

	it.each(['', 'categories/en:spreads', 'labels//categories'])('does not match "%s"', (param) => {
		expect(isDrilldownPath(param)).toBe(false);
	});
});
