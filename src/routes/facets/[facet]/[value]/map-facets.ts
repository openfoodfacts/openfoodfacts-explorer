import { getOrDefault } from '#lib/api/taxonomy/types';
import type { getTaxo } from '#lib/api/taxonomy/api';

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

type Products = Array<Partial<Record<MapFacet['tagsField'], unknown>>>;
type Taxonomy = Awaited<ReturnType<typeof getTaxo>>;

export function getFacetDistribution(
	products: Products,
	tagsField: MapFacet['tagsField'],
	taxonomy: Taxonomy | undefined,
	lang: string
) {
	const tagCounts: Record<string, number> = {};

	for (const product of products) {
		const tags = product[tagsField];
		if (!Array.isArray(tags)) continue;

		for (const id of tags as string[]) tagCounts[id] = (tagCounts[id] ?? 0) + 1;
	}

	const tags = Object.entries(tagCounts).map(([id, productCount]) => {
		const name = taxonomy?.[id]?.name;
		return {
			id,
			products: productCount,
			known: 1,
			name: name ? (getOrDefault(name, lang) ?? id) : id
		};
	});

	return tags.length ? { count: tags.length, tags } : null;
}
