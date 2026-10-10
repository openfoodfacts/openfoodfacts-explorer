import { getFacetValue } from '#lib/api/facets.js';
import { getOrDefault } from '#lib/api/taxonomy/types.js';
import { API_HOST } from '#lib/const.js';

type TaxoEntry = { name?: Record<string, string>; parents?: string[]; children?: string[] };

export type HierarchyItem = { id: string; name: string; count?: number };

const MAX_COUNTED_CHILDREN = 30;

export function sortChildren(children: HierarchyItem[]) {
	return children
		.filter((c) => c.count !== 0)
		.sort((a, b) => (b.count ?? -1) - (a.count ?? -1) || a.name.localeCompare(b.name));
}

export async function getHierarchy(
	fetch: typeof window.fetch,
	facet: string,
	value: string,
	lang: string
) {
	const params = new URLSearchParams({
		tagtype: facet,
		tags: value,
		include_parents: '1',
		include_children: '1',
		fields: 'name,parents,children'
	});
	const res = await fetch(`${API_HOST}/api/v2/taxonomy?${params}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch ${facet} hierarchy: ${res.status}`);
	}
	const taxo: Record<string, TaxoEntry> = await res.json();
	const toItem = (id: string): HierarchyItem => ({
		id,
		name: getOrDefault(taxo[id]?.name ?? {}, lang) ?? id
	});

	const children = (taxo[value]?.children ?? []).map(toItem);
	if (children.length <= MAX_COUNTED_CHILDREN) {
		const counts = await Promise.allSettled(
			children.map((c) => getFacetValue(fetch, facet, c.id, { pageSize: 1 }))
		);
		counts.forEach((r, i) => {
			if (r.status === 'fulfilled') children[i].count = r.value.count;
		});
	}

	return {
		parents: (taxo[value]?.parents ?? []).map(toItem),
		children: sortChildren(children)
	};
}
