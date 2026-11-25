export type ContributionFacet = 'editors' | 'photographers' | 'contributors';

export type ContributionLink = {
	facet: ContributionFacet;
	username: string;
	labelKey: string;
	defaultLabel: string;
};

const CONTRIBUTION_FACETS: ReadonlyArray<{
	facet: ContributionFacet;
	labelKey: string;
	defaultLabel: string;
}> = [
	{
		facet: 'editors',
		labelKey: 'settings.contribution_links.edited_products',
		defaultLabel: 'Edited products'
	},
	{
		facet: 'photographers',
		labelKey: 'settings.contribution_links.photographed_products',
		defaultLabel: 'Photographed products'
	},
	{
		facet: 'contributors',
		labelKey: 'settings.contribution_links.added_products',
		defaultLabel: 'Added products'
	}
];

/** Builds shortcut descriptors for a contributor's edited, photographed, and added product lists. */
export function getContributionLinks(username: string | null | undefined): ContributionLink[] {
	const trimmed = username?.trim();
	if (!trimmed) return [];

	return CONTRIBUTION_FACETS.map((entry) => ({
		...entry,
		username: trimmed
	}));
}
