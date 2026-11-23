import { getOrDefault } from '#lib/api/taxonomy/types.js';
import type { getTaxo } from '#lib/api/taxonomy/api.js';

import type { MapFacet } from '../map-facets';

type Products = Array<Partial<Record<MapFacet['tagsField'], unknown>>>;
type Taxonomy = Awaited<ReturnType<typeof getTaxo>>;

export function queryValuesToDistribution(
	values: { _id: string; count: number }[],
	taxonomy: Taxonomy | undefined,
	lang: string
) {
	if (!values.length) return null;
	const tags = values.map(({ _id: id, count: products }) => ({
		id,
		products,
		known: 1,
		name: getOrDefault(taxonomy?.[id]?.name ?? {}, lang) ?? id
	}));
	return { count: tags.length, tags };
}

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
