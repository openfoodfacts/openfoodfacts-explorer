import { describe, expect, it } from 'vitest';
import { requireInt, requirePositiveInt } from './utils';

const throwInvalid = () => {
	throw new Error('invalid');
};

describe('requireInt', () => {
	it('returns a parsed integer for strict integer strings', () => {
		expect(requireInt('42', throwInvalid)).toBe(42);
		expect(requireInt('-7', throwInvalid)).toBe(-7);
		expect(requireInt(' 3 ', throwInvalid)).toBe(3);
	});

	it('rejects malformed integer values', () => {
		expect(() => requireInt(null, throwInvalid)).toThrow('invalid');
		expect(() => requireInt('abc', throwInvalid)).toThrow('invalid');
		expect(() => requireInt('1abc', throwInvalid)).toThrow('invalid');
		expect(() => requireInt('1.5', throwInvalid)).toThrow('invalid');
		expect(() => requireInt('', throwInvalid)).toThrow('invalid');
	});
});

describe('requirePositiveInt', () => {
	it('returns a parsed integer when the value is positive', () => {
		expect(requirePositiveInt('1', throwInvalid)).toBe(1);
		expect(requirePositiveInt('24', throwInvalid)).toBe(24);
	});

	it('rejects zero, negative, and malformed values', () => {
		expect(() => requirePositiveInt('0', throwInvalid)).toThrow('invalid');
		expect(() => requirePositiveInt('-1', throwInvalid)).toThrow('invalid');
		expect(() => requirePositiveInt('abc', throwInvalid)).toThrow('invalid');
	});
});
