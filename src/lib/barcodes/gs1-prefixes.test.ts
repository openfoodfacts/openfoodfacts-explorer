import { describe, expect, it } from 'vitest';
import { getFlagEmoji, getGs1Allocation } from './gs1-prefixes';

describe('getGs1Allocation()', () => {
	it('prefers the most specific matching prefix', () => {
		expect(getGs1Allocation('3017620422003')).toMatchObject({
			name: 'France and Monaco',
			code: 'FR-MC'
		});
	});

	it('supports shorter GS1 prefixes', () => {
		expect(getGs1Allocation('4006381333931')).toMatchObject({ name: 'Germany', code: 'DE' });
		expect(getGs1Allocation('023456789012')).toMatchObject({
			name: 'USA and Canada',
			code: 'US-CA'
		});
	});

	it('returns an unknown allocation when no prefix matches', () => {
		expect(getGs1Allocation('9999999999999')).toEqual({ name: 'Unknown', prefixes: [], code: '' });
	});
});

describe('getFlagEmoji()', () => {
	it('renders flags for combined allocations', () => {
		expect(getFlagEmoji('FR-MC')).toBe('🇫🇷🇲🇨');
	});
});
