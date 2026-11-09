export type MapFacet = {
	tagsField: 'origins_tags' | 'countries_tags';
	heading: string;
	defaultHeading: string;
};

export const MAP_FACETS: Record<string, MapFacet> = {
	origins: {
		tagsField: 'origins_tags',
		heading: 'facets.map_heading_origins',
		defaultHeading: 'Origins of the ingredients'
	},
	countries: {
		tagsField: 'countries_tags',
		heading: 'facets.map_heading_countries',
		defaultHeading: 'Where these products are sold'
	}
};
