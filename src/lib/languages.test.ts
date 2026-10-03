import { describe, expect, it } from 'vitest';
import { getLanguageOption } from './languages';

describe('getLanguageOption', () => {
	it('shows the English name and the name in that language', () => {
		expect(getLanguageOption('hi').label).toBe('Hindi (हिन्दी)');
		expect(getLanguageOption('fr').label).toBe('French (Français)');
		expect(getLanguageOption('de').label).toBe('German (Deutsch)');
	});

	it('repeats the English name when it is also the vernacular name', () => {
		expect(getLanguageOption('en').label).toBe('English (English)');
	});
});
