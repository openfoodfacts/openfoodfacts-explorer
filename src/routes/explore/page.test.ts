import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('explore page', () => {
	it('hides its own search bar on xl screens, where the navbar already has one', () => {
		const source = readFileSync(new URL('./+page.svelte', import.meta.url), 'utf-8');
		const wrapper = source.match(/<div class="([^"]*)">\s*<SearchBar/);

		expect(wrapper).not.toBeNull();
		expect(wrapper![1].split(' ')).toContain('xl:hidden');
	});
});
