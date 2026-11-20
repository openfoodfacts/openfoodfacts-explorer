import { describe, expect, it } from 'vitest';
import { load as editorLoad } from '../editor/[user]/+page.js';
import { load as contributorLoad } from '../contributor/[user]/+page.js';
import { load as photographerLoad } from '../photographer/[user]/+page.js';

describe('legacy user profile redirects', () => {
	const loaders = [
		{ name: '/editor/[user]', load: editorLoad, path: '/world-en/editor/teolemon' },
		{ name: '/contributor/[user]', load: contributorLoad, path: '/world-en/contributor/teolemon' },
		{
			name: '/photographer/[user]',
			load: photographerLoad,
			path: '/world-en/photographer/teolemon'
		}
	];

	it.each(loaders)('$name 301-redirects to the canonical user profile', async ({ load, path }) => {
		const url = new URL(`https://example.com${path}`);
		await expect(load({ params: { user: 'teolemon' }, url } as never)).rejects.toMatchObject({
			status: 301,
			location: '/world-en/users/teolemon'
		});
	});

	it.each(loaders)('$name preserves custom language/country prefix', async ({ load, name }) => {
		const route = name.split('/')[1];
		const url = new URL(`https://example.com/world-fr/${route}/alex`);
		await expect(load({ params: { user: 'alex' }, url } as never)).rejects.toMatchObject({
			status: 301,
			location: '/world-fr/users/alex'
		});
	});

	it.each(loaders)('$name preserves query search parameters', async ({ load, name }) => {
		const route = name.split('/')[1];
		const url = new URL(`https://example.com/world-en/${route}/teolemon?page=2&sort=name`);
		await expect(load({ params: { user: 'teolemon' }, url } as never)).rejects.toMatchObject({
			status: 301,
			location: '/world-en/users/teolemon?page=2&sort=name'
		});
	});
});
