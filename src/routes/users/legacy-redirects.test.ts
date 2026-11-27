import { describe, expect, it } from 'vitest';
import { load as editorLoad } from '../editor/[user]/+page.js';
import { load as contributorLoad } from '../contributor/[user]/+page.js';
import { load as photographerLoad } from '../photographer/[user]/+page.js';

describe('legacy user profile redirects', () => {
	const loaders = [
		{
			name: '/editor/[user]',
			load: editorLoad,
			path: '/world-en/editor/teolemon',
			expected: '/world-en/facets/editors/teolemon',
			facet: 'editors'
		},
		{
			name: '/contributor/[user]',
			load: contributorLoad,
			path: '/world-en/contributor/teolemon',
			expected: '/world-en/facets/contributors/teolemon',
			facet: 'contributors'
		},
		{
			name: '/photographer/[user]',
			load: photographerLoad,
			path: '/world-en/photographer/teolemon',
			expected: '/world-en/facets/photographers/teolemon',
			facet: 'photographers'
		}
	];

	it.each(loaders)(
		'$name 301-redirects to the matching facet page',
		async ({ load, path, expected }) => {
			const url = new URL(`https://example.com${path}`);
			await expect(load({ params: { user: 'teolemon' }, url } as never)).rejects.toMatchObject({
				status: 301,
				location: expected
			});
		}
	);

	it.each(loaders)(
		'$name preserves custom language/country prefix',
		async ({ load, name, facet }) => {
			const route = name.split('/')[1];
			const url = new URL(`https://example.com/world-fr/${route}/alex`);
			await expect(load({ params: { user: 'alex' }, url } as never)).rejects.toMatchObject({
				status: 301,
				location: `/world-fr/facets/${facet}/alex`
			});
		}
	);

	it.each(loaders)('$name preserves query search parameters', async ({ load, name, facet }) => {
		const route = name.split('/')[1];
		const url = new URL(`https://example.com/world-en/${route}/teolemon?page=2&sort=name`);
		await expect(load({ params: { user: 'teolemon' }, url } as never)).rejects.toMatchObject({
			status: 301,
			location: `/world-en/facets/${facet}/teolemon?page=2&sort=name`
		});
	});
});
