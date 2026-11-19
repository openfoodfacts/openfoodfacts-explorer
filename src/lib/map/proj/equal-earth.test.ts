import { describe, expect, it } from 'vitest';
import { projectEqualEarth, unprojectEqualEarth } from './equal-earth';

describe('Equal Earth projection', () => {
	it('matches the published PROJ unit-sphere example', () => {
		// https://proj.org/en/stable/operations/projections/eqearth.html
		const [x, y] = projectEqualEarth(122, 47);
		expect(x).toBeCloseTo(1.55, 2);
		expect(y).toBeCloseTo(0.89, 2);
	});

	it.each([
		[0, 0],
		[122, 47],
		[-73.9, 40.7],
		[180, 0],
		[-180, 85],
		[40, 90],
		[-40, -90]
	])('round trips longitude %s and latitude %s', (lng, lat) => {
		const [x, y] = projectEqualEarth(lng, lat);
		const [actualLng, actualLat] = unprojectEqualEarth(x, y);
		expect(actualLng).toBeCloseTo(lng, 7);
		expect(actualLat).toBeCloseTo(lat, 6);
	});

	it('returns finite coordinates outside the projected poles', () => {
		for (const y of [-100, 100]) {
			const [lng, lat] = unprojectEqualEarth(1, y);
			expect(Number.isFinite(lng)).toBe(true);
			expect(Math.abs(lat)).toBeCloseTo(90, 6);
		}
	});
});
