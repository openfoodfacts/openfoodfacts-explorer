import { describe, expect, it } from 'vitest';

import enUS from './en-US.json';
import en from './en.json';

describe('Compare mode labels', () => {
	it('uses clear English terminology for the NOVA classification', () => {
		expect(enUS.compare.nova_group).toBe('Ultra-processed level');
		expect(en.compare.nova_group).toBe('Ultra-processed level');
	});
});
