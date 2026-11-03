import { API_HOST } from '#lib/const.js';
import { createProductsApi } from '../product';
import type { KnowledgePanels, KnowledgeTableElement } from '../knowledgepanels';
import { getOrDefault } from './types';

type TaxoEntry = { name?: Record<string, string>; parents?: string[]; children?: string[] };

export type HierarchyItem = { id: string; name: string };

const baseLanguage = (lang: string) => lang.replaceAll('_', '-').toLowerCase().split('-')[0];

export async function getHierarchy(
	fetch: typeof window.fetch,
	facet: string,
	value: string,
	lang: string
) {
	const baseLang = baseLanguage(lang);
	const params = new URLSearchParams({
		tagtype: facet,
		tags: value,
		include_parents: '1',
		include_children: '1',
		// Without lc the API answers in English only; en is the fallback for untranslated names.
		lc: `${baseLang},en`,
		fields: 'name,parents,children'
	});
	// TODO: switch to the SDK's getTaxoEntries once openfoodfacts-js#994 is released
	const res = await fetch(`${API_HOST}/api/v2/taxonomy?${params}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch ${facet} hierarchy: ${res.status}`);
	}
	const taxo: Record<string, TaxoEntry> = await res.json();
	const toItem = (id: string): HierarchyItem => ({
		id,
		name: getOrDefault(taxo[id]?.name ?? {}, lang) ?? id
	});
	const byName = (a: HierarchyItem, b: HierarchyItem) => a.name.localeCompare(b.name, baseLang);

	return {
		parents: (taxo[value]?.parents ?? []).map(toItem),
		children: (taxo[value]?.children ?? []).map(toItem).sort(byName)
	};
}

/**
 * Fetch the product count of each subcategory of a category.
 * @returns Counts by localized subcategory name, empty for other facets or when the request fails
 */
export async function getChildCounts(
	fetch: typeof window.fetch,
	facet: string,
	value: string,
	lang: string
): Promise<Map<string, number>> {
	if (facet !== 'categories') return new Map();
	try {
		const { data } = await createProductsApi(fetch).apiv3.client.GET(
			'/api/v3/tag/{tagtype}/{tag_or_tagid}',
			{
				params: {
					path: { tagtype: facet, tag_or_tagid: value },
					query: {
						lc: `${baseLanguage(lang)},en`,
						activate_knowledge_panel_related_categories: 1
					}
				}
			}
		);
		const panels = (data as { tag?: { knowledge_panels?: KnowledgePanels } } | undefined)?.tag
			?.knowledge_panels;
		const table = panels?.related_categories?.elements?.find(
			(e): e is KnowledgeTableElement =>
				e.element_type === 'table' && e.table_element.id === 'related_categories_children'
		);
		return new Map(
			table?.table_element.rows.map((r) => [r.values[0].text, Number(r.values[1].text)])
		);
	} catch {
		return new Map();
	}
}

/** @returns The items with a count first, biggest first, then the others in their current order */
export function sortByCount(items: HierarchyItem[], counts: Map<string, number>) {
	return items.toSorted((a, b) => (counts.get(b.name) ?? -1) - (counts.get(a.name) ?? -1));
}
