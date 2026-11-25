import { describe, expect, it } from 'vitest';
import { getContributionLinks } from './contribution-links.js';

describe('getContributionLinks', () => {
	it('returns shortcuts for edited, photographed, and added products', () => {
		expect(getContributionLinks('alice')).toEqual([
			{
				facet: 'editors',
				username: 'alice',
				labelKey: 'settings.contribution_links.edited_products',
				defaultLabel: 'Edited products'
			},
			{
				facet: 'photographers',
				username: 'alice',
				labelKey: 'settings.contribution_links.photographed_products',
				defaultLabel: 'Photographed products'
			},
			{
				facet: 'contributors',
				username: 'alice',
				labelKey: 'settings.contribution_links.added_products',
				defaultLabel: 'Added products'
			}
		]);
	});

	it('trims surrounding whitespace and returns empty for missing usernames', () => {
		expect(getContributionLinks('  bob  ').map((link) => link.username)).toEqual([
			'bob',
			'bob',
			'bob'
		]);
		expect(getContributionLinks('')).toEqual([]);
		expect(getContributionLinks('   ')).toEqual([]);
		expect(getContributionLinks(null)).toEqual([]);
		expect(getContributionLinks(undefined)).toEqual([]);
	});
});
