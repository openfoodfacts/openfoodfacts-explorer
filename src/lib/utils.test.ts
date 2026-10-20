import { describe, expect, it } from 'vitest';
import { requireBoundedInt } from './utils';

const invalid = (): never => {
	throw new Error('invalid');
};

describe('requireBoundedInt', () => {
	it('returns integers within the inclusive range', () => {
		expect(requireBoundedInt('1', { min: 1, max: 200 }, invalid)).toBe(1);
		expect(requireBoundedInt('200', { min: 1, max: 200 }, invalid)).toBe(200);
	});

	it.each(['0', '-1', '201', '1.5', '10products', ''])('rejects invalid value %j', (value) => {
		expect(() => requireBoundedInt(value, { min: 1, max: 200 }, invalid)).toThrow('invalid');
	});
});
