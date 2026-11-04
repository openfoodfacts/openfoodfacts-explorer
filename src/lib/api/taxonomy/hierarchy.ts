import { API_HOST } from '#lib/const.js';
import { getOrDefault } from './types';

type TaxoEntry = { name?: Record<string, string>; parents?: string[]; children?: string[] };

export type HierarchyItem = { id: string; name: string };

export async function getHierarchy(
	fetch: typeof window.fetch,
	facet: string,
	value: string,
	lang: string
) {
	const baseLang = lang.replaceAll('_', '-').toLowerCase().split('-')[0];
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
