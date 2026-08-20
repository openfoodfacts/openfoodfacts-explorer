import type { Component, ComponentType } from 'svelte';
import IconMaterialGlobeLocationPin from '@iconify-svelte/material-symbols/globe-location-pin';
import IconMaterialTrafficOutline from '@iconify-svelte/material-symbols/traffic-outline';
import IconMdiAccountGroup from '@iconify-svelte/mdi/account-group';
import IconMdiAccountMultiple from '@iconify-svelte/mdi/account-multiple';
import IconMdiAlert from '@iconify-svelte/mdi/alert';
import IconMdiAlertCircle from '@iconify-svelte/mdi/alert-circle';
import IconMdiAlertOctagon from '@iconify-svelte/mdi/alert-octagon';
import IconMdiBarcode from '@iconify-svelte/mdi/barcode';
import IconMdiCamera from '@iconify-svelte/mdi/camera';
import IconMdiCheckboxMarked from '@iconify-svelte/mdi/checkbox-marked';
import IconMdiDatabase from '@iconify-svelte/mdi/database';
import IconMdiDiamond from '@iconify-svelte/mdi/diamond';
import IconMdiDna from '@iconify-svelte/mdi/dna';
import IconMdiDomain from '@iconify-svelte/mdi/domain';
import IconMdiDotsHorizontal from '@iconify-svelte/mdi/dots-horizontal';
import IconMdiEarth from '@iconify-svelte/mdi/earth';
import IconMdiFactory from '@iconify-svelte/mdi/factory';
import IconMdiFlask from '@iconify-svelte/mdi/flask';
import IconMdiFoodVariant from '@iconify-svelte/mdi/food-variant';
import IconMdiLabel from '@iconify-svelte/mdi/label';
import IconMdiLeaf from '@iconify-svelte/mdi/leaf';
import IconMdiMagnify from '@iconify-svelte/mdi/magnify';
import IconMdiMolecule from '@iconify-svelte/mdi/molecule';
import IconMdiNumeric from '@iconify-svelte/mdi/numeric';
import IconMdiPackage from '@iconify-svelte/mdi/package';
import IconMdiPill from '@iconify-svelte/mdi/pill';
import IconMdiPlusCircle from '@iconify-svelte/mdi/plus-circle';
import IconMdiRecycle from '@iconify-svelte/mdi/recycle';
import IconMdiShape from '@iconify-svelte/mdi/shape';
import IconMdiShapeOutline from '@iconify-svelte/mdi/shape-outline';
import IconMdiSprout from '@iconify-svelte/mdi/sprout';
import IconMdiStar from '@iconify-svelte/mdi/star';
import IconMdiStore from '@iconify-svelte/mdi/store';
import IconMdiTag from '@iconify-svelte/mdi/tag';
import IconMdiTranslate from '@iconify-svelte/mdi/translate';

// Lucene supports a complex language to search for documents,
// but without implementing a full parser we cannot do much.

export type FacetsSelection = {
	[facet: string]: {
		include: string[];
		exclude: string[];
	};
};

export type FacetCatalogItem = {
	key: string;
	searchField?: string;
	labelKey: string;
	defaultLabel: string;
	category: 'General' | 'Nutrition & Health' | 'Packaging & Origin' | 'Community & Metadata';
	icon: Component | ComponentType;
	isFreeText?: boolean;
	placeholder?: string;
	defaultVisible?: boolean;
};

export function getSearchFieldForFacet(facetKey: string): string {
	const catalogItem = MASTER_FACET_CATALOG.find((f) => f.key === facetKey);
	return catalogItem?.searchField || facetKey;
}

export function getFacetKeyForSearchField(searchField: string): string {
	const catalogItem = MASTER_FACET_CATALOG.find(
		(f) => f.searchField === searchField || f.key === searchField
	);
	return catalogItem?.key || searchField;
}

export function toLuceneString(query: string, facets: FacetsSelection): string {
	const parts: string[] = [];
	if (query && query.length > 0) {
		parts.push(query);
	}

	// Now we create the Conjunctive Normal Form
	const orExpr = (terms: string[]) => terms.map((term) => `"${term}"`).join(' OR ');

	for (const [facet, values] of Object.entries(facets)) {
		const searchField = getSearchFieldForFacet(facet);
		if (values.include && values.include.length > 0) {
			parts.push(`${searchField}:(${orExpr(values.include)})`);
		}
		if (values.exclude && values.exclude.length > 0) {
			parts.push(`-${searchField}:(${orExpr(values.exclude)})`);
		}
	}

	return parts.join(' AND ');
}

export function extractQuery(luceneQuery: string): string {
	// split at first AND / OR / NOT
	const queryParts = luceneQuery
		.split(/ AND /)
		.map((part) => part.trim())
		.filter((it) => it.length > 0 && ['AND', 'OR', 'NOT'].includes(it) === false);

	// the main query is not in 'key:value' format
	return queryParts.filter((part) => !part.includes(':')).join(' ');
}

export function addIncludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...sel };
	if (!newQuery[facet]) {
		newQuery[facet] = { include: [], exclude: [] };
	}
	if (!newQuery[facet].include.includes(value)) {
		newQuery[facet].include.push(value);
	}
	return newQuery;
}

export function addExcludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...sel };
	if (!newQuery[facet]) {
		newQuery[facet] = { include: [], exclude: [] };
	}
	if (!newQuery[facet].exclude.includes(value)) {
		newQuery[facet].exclude.push(value);
	}
	return newQuery;
}

export function removeIncludeFacet(
	query: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...query };
	if (newQuery[facet]) {
		newQuery[facet] = {
			...newQuery[facet],
			include: newQuery[facet].include.filter((v: string) => v !== value)
		};
	}
	return newQuery;
}

export function removeExcludeFacet(
	query: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...query };
	if (newQuery[facet]) {
		newQuery[facet] = {
			...newQuery[facet],
			exclude: newQuery[facet].exclude.filter((v: string) => v !== value)
		};
	}
	return newQuery;
}

export function toggleIncludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const isCurrentlyIncluded = sel[facet]?.include?.includes(value);
	if (isCurrentlyIncluded) {
		return removeIncludeFacet(sel, facet, value);
	} else {
		const withoutExclude = removeExcludeFacet(sel, facet, value);
		return addIncludeFacet(withoutExclude, facet, value);
	}
}

export function toggleExcludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const isCurrentlyExcluded = sel[facet]?.exclude?.includes(value);
	if (isCurrentlyExcluded) {
		return removeExcludeFacet(sel, facet, value);
	} else {
		const withoutInclude = removeIncludeFacet(sel, facet, value);
		return addExcludeFacet(withoutInclude, facet, value);
	}
}

function splitOutsideQuotes(str: string, delimiterPattern: RegExp): string[] {
	const result: string[] = [];
	let current = '';
	let inQuotes = false;
	let i = 0;

	while (i < str.length) {
		const char = str[i];
		if (char === '"') {
			inQuotes = !inQuotes;
			current += char;
			i++;
		} else if (!inQuotes) {
			const remaining = str.slice(i);
			const match = remaining.match(delimiterPattern);
			if (match && match.index === 0) {
				if (current.trim()) {
					result.push(current.trim());
				}
				current = '';
				i += match[0].length;
			} else {
				current += char;
				i++;
			}
		} else {
			current += char;
			i++;
		}
	}
	if (current.trim()) {
		result.push(current.trim());
	}
	return result;
}

export function parseLuceneFacets(luceneQuery: string): FacetsSelection {
	const sel: FacetsSelection = {};
	if (!luceneQuery) return sel;

	const parts = splitOutsideQuotes(luceneQuery, /^\s+AND\s+/i);

	for (const part of parts) {
		const trimmed = part.trim();
		if (!trimmed) continue;

		const isExclude = trimmed.startsWith('-');
		const cleanPart = isExclude ? trimmed.slice(1) : trimmed;

		const colonIdx = cleanPart.indexOf(':');
		if (colonIdx === -1) continue;

		const rawFacet = cleanPart.slice(0, colonIdx).trim();
		const facet = getFacetKeyForSearchField(rawFacet);
		let valExpr = cleanPart.slice(colonIdx + 1).trim();

		if (!facet || !valExpr) continue;

		if (valExpr.startsWith('(') && valExpr.endsWith(')')) {
			valExpr = valExpr.slice(1, -1).trim();
		}

		const values = splitOutsideQuotes(valExpr, /^\s+OR\s+/i)
			.map((v) => v.trim().replace(/^"(.*)"$/, '$1'))
			.filter((v) => v.length > 0);

		if (!sel[facet]) {
			sel[facet] = { include: [], exclude: [] };
		}

		if (isExclude) {
			for (const val of values) {
				if (!sel[facet].exclude.includes(val)) {
					sel[facet].exclude.push(val);
				}
			}
		} else {
			for (const val of values) {
				if (!sel[facet].include.includes(val)) {
					sel[facet].include.push(val);
				}
			}
		}
	}

	return sel;
}

export const MASTER_FACET_CATALOG: FacetCatalogItem[] = [
	{
		key: 'brands',
		labelKey: 'facets.brands',
		defaultLabel: 'Brands',
		category: 'General',
		icon: IconMdiTag,
		defaultVisible: true
	},
	{
		key: 'categories',
		labelKey: 'facets.categories',
		defaultLabel: 'Categories',
		category: 'General',
		icon: IconMdiShape,
		defaultVisible: true
	},
	{
		key: 'nutrition_grades',
		labelKey: 'facets.nutrition_grades',
		defaultLabel: 'Nutri-Score',
		category: 'Nutrition & Health',
		icon: IconMaterialTrafficOutline,
		defaultVisible: true
	},
	{
		key: 'environmental_score_grade',
		labelKey: 'facets.environmental_score_grade',
		defaultLabel: 'Green-Score',
		category: 'Nutrition & Health',
		icon: IconMdiLeaf,
		defaultVisible: true
	},
	{
		key: 'nova_group',
		labelKey: 'facets.nova_group',
		defaultLabel: 'Ultra-processing level (NOVA)',
		category: 'Nutrition & Health',
		icon: IconMdiNumeric,
		defaultVisible: true
	},
	{
		key: 'labels',
		labelKey: 'facets.labels',
		defaultLabel: 'Labels & Certifications',
		category: 'General',
		icon: IconMdiLabel,
		defaultVisible: true
	},
	{
		key: 'countries',
		labelKey: 'facets.countries',
		defaultLabel: 'Countries',
		category: 'Packaging & Origin',
		icon: IconMdiEarth,
		defaultVisible: true
	},
	{
		key: 'allergens',
		labelKey: 'facets.allergens',
		defaultLabel: 'Allergens',
		category: 'Nutrition & Health',
		icon: IconMdiAlert,
		defaultVisible: true
	},
	{
		key: 'additives',
		labelKey: 'facets.additives',
		defaultLabel: 'Additives',
		category: 'Nutrition & Health',
		icon: IconMdiFlask,
		defaultVisible: true
	},
	{
		key: 'stores',
		labelKey: 'facets.stores',
		defaultLabel: 'Stores',
		category: 'General',
		icon: IconMdiStore,
		defaultVisible: true
	},
	{
		key: 'languages',
		labelKey: 'facets.languages',
		defaultLabel: 'Languages',
		category: 'General',
		icon: IconMdiTranslate,
		defaultVisible: true
	},
	{
		key: 'origins',
		labelKey: 'facets.origins',
		defaultLabel: 'Origins of Ingredients',
		category: 'Packaging & Origin',
		icon: IconMaterialGlobeLocationPin,
		isFreeText: true,
		placeholder: 'e.g. France, Italy...',
		defaultVisible: true
	},
	{
		key: 'manufacturing_places',
		labelKey: 'facets.manufacturing_places',
		defaultLabel: 'Manufacturing Places',
		category: 'Packaging & Origin',
		icon: IconMdiFactory,
		isFreeText: true,
		placeholder: 'e.g. Berlin, Germany...',
		defaultVisible: true
	},
	{
		key: 'emb_codes',
		labelKey: 'facets.emb_codes',
		defaultLabel: 'Traceability Codes (EMB)',
		category: 'Packaging & Origin',
		icon: IconMdiBarcode,
		isFreeText: true,
		placeholder: 'e.g. FR 75.056.001 EC...',
		defaultVisible: true
	},

	// Additional Facets Available to Add on Demand
	{
		key: 'packaging',
		searchField: 'packagings.material',
		labelKey: 'facets.packaging',
		defaultLabel: 'Packaging & Materials',
		category: 'Packaging & Origin',
		icon: IconMdiPackage,
		isFreeText: true,
		placeholder: 'e.g. glass, cardboard, plastic...',
		defaultVisible: false
	},
	{
		key: 'ingredients',
		searchField: 'ingredients_tags',
		labelKey: 'facets.ingredients',
		defaultLabel: 'Ingredients',
		category: 'Nutrition & Health',
		icon: IconMdiFoodVariant,
		isFreeText: true,
		placeholder: 'e.g. sugar, palm oil, cocoa...',
		defaultVisible: false
	},
	{
		key: 'traces',
		labelKey: 'facets.traces',
		defaultLabel: 'Traces & Cross-contamination',
		category: 'Nutrition & Health',
		icon: IconMdiMagnify,
		isFreeText: true,
		placeholder: 'e.g. gluten, nuts, milk...',
		defaultVisible: false
	},
	{
		key: 'vitamins',
		labelKey: 'facets.vitamins',
		defaultLabel: 'Added Vitamins',
		category: 'Nutrition & Health',
		icon: IconMdiPill,
		isFreeText: true,
		placeholder: 'e.g. vitamin-c, vitamin-d...',
		defaultVisible: false
	},
	{
		key: 'minerals',
		labelKey: 'facets.minerals',
		defaultLabel: 'Added Minerals',
		category: 'Nutrition & Health',
		icon: IconMdiDiamond,
		isFreeText: true,
		placeholder: 'e.g. calcium, iron, zinc...',
		defaultVisible: false
	},
	{
		key: 'amino_acids',
		labelKey: 'facets.amino_acids',
		defaultLabel: 'Added Amino Acids',
		category: 'Nutrition & Health',
		icon: IconMdiMolecule,
		isFreeText: true,
		placeholder: 'e.g. taurine, l-carnitine...',
		defaultVisible: false
	},
	{
		key: 'nucleotides',
		labelKey: 'facets.nucleotides',
		defaultLabel: 'Added Nucleotides',
		category: 'Nutrition & Health',
		icon: IconMdiDna,
		isFreeText: true,
		placeholder: 'e.g. inosine...',
		defaultVisible: false
	},
	{
		key: 'other_nutritional_substances',
		searchField: 'other_nutritional_substances_tags',
		labelKey: 'facets.other_nutritional_substances',
		defaultLabel: 'Other Nutritional Substances',
		category: 'Nutrition & Health',
		icon: IconMdiPlusCircle,
		isFreeText: true,
		placeholder: 'e.g. coenzyme-q10...',
		defaultVisible: false
	},
	{
		key: 'states',
		labelKey: 'facets.states',
		defaultLabel: 'Completion Status',
		category: 'Community & Metadata',
		icon: IconMdiCheckboxMarked,
		isFreeText: true,
		placeholder: 'e.g. complete, to-be-checked...',
		defaultVisible: false
	},
	{
		key: 'data_sources',
		labelKey: 'facets.data_sources',
		defaultLabel: 'Data Sources',
		category: 'Community & Metadata',
		icon: IconMdiDatabase,
		isFreeText: true,
		placeholder: 'e.g. database-name...',
		defaultVisible: false
	},
	{
		key: 'contributors',
		searchField: 'creator',
		labelKey: 'facets.contributors',
		defaultLabel: 'Contributors',
		category: 'Community & Metadata',
		icon: IconMdiAccountGroup,
		isFreeText: true,
		placeholder: 'e.g. username...',
		defaultVisible: false
	},
	{
		key: 'teams',
		labelKey: 'facets.teams',
		defaultLabel: 'Teams',
		category: 'Community & Metadata',
		icon: IconMdiAccountMultiple,
		isFreeText: true,
		placeholder: 'e.g. team-name...',
		defaultVisible: false
	},
	{
		key: 'misc',
		searchField: 'misc_tags',
		labelKey: 'facets.misc',
		defaultLabel: 'Miscellaneous Tags',
		category: 'General',
		icon: IconMdiDotsHorizontal,
		isFreeText: true,
		placeholder: 'e.g. tag...',
		defaultVisible: false
	},
	{
		key: 'packaging_shapes',
		searchField: 'packagings.shape',
		labelKey: 'facets.packaging_shapes',
		defaultLabel: 'Packaging shapes',
		category: 'Packaging & Origin',
		icon: IconMdiShapeOutline,
		isFreeText: true,
		placeholder: 'e.g. bottle, can, box, jar...',
		defaultVisible: false
	},
	{
		key: 'packaging_recycling',
		searchField: 'packagings.recycling',
		labelKey: 'facets.packaging_recycling',
		defaultLabel: 'Packaging recycling',
		category: 'Packaging & Origin',
		icon: IconMdiRecycle,
		isFreeText: true,
		placeholder: 'e.g. recycle, discard...',
		defaultVisible: false
	},
	{
		key: 'ingredients_analysis',
		searchField: 'ingredients_analysis',
		labelKey: 'facets.ingredients_analysis',
		defaultLabel: 'Ingredients analysis',
		category: 'Nutrition & Health',
		icon: IconMdiSprout,
		isFreeText: true,
		placeholder: 'e.g. vegan, vegetarian, palm-oil-free...',
		defaultVisible: false
	},
	{
		key: 'owner',
		searchField: 'owner',
		labelKey: 'facets.owner',
		defaultLabel: 'Brand owner',
		category: 'General',
		icon: IconMdiDomain,
		isFreeText: true,
		placeholder: 'e.g. company name, owner...',
		defaultVisible: false
	},
	{
		key: 'photographers',
		searchField: 'photographers',
		labelKey: 'facets.photographers',
		defaultLabel: 'Photographers',
		category: 'Community & Metadata',
		icon: IconMdiCamera,
		isFreeText: true,
		placeholder: 'e.g. username...',
		defaultVisible: false
	},
	{
		key: 'data_quality_warnings',
		searchField: 'data_quality_warnings',
		labelKey: 'facets.data_quality_warnings',
		defaultLabel: 'Data quality warnings',
		category: 'Community & Metadata',
		icon: IconMdiAlertOctagon,
		isFreeText: true,
		placeholder: 'e.g. warning tag...',
		defaultVisible: false
	},
	{
		key: 'data_quality_errors',
		searchField: 'data_quality_errors_tags',
		labelKey: 'facets.data_quality_errors',
		defaultLabel: 'Data quality errors',
		category: 'Community & Metadata',
		icon: IconMdiAlertCircle,
		isFreeText: true,
		placeholder: 'e.g. error tag...',
		defaultVisible: false
	},
	{
		key: 'popularity_tags',
		searchField: 'popularity_tags',
		labelKey: 'facets.popularity_tags',
		defaultLabel: 'Popularity',
		category: 'General',
		icon: IconMdiStar,
		isFreeText: true,
		placeholder: 'e.g. top-1000-fr...',
		defaultVisible: false
	}
];

export const DEFAULT_VISIBLE_FACET_KEYS = MASTER_FACET_CATALOG.filter((f) => f.defaultVisible).map(
	(f) => f.key
);

export const KNOWN_AGGREGATED_FACETS = [
	'brands',
	'categories',
	'nutrition_grades',
	'environmental_score_grade',
	'nova_group',
	'labels',
	'countries',
	'allergens',
	'additives',
	'stores',
	'languages'
];

export const DEFAULT_FREE_TEXT_FACETS: FacetCatalogItem[] = MASTER_FACET_CATALOG.filter(
	(f) => f.isFreeText && f.defaultVisible
);

export function groupCatalogFacets(items: FacetCatalogItem[]): Record<string, FacetCatalogItem[]> {
	const groups: Record<string, FacetCatalogItem[]> = {};
	for (const item of items) {
		if (!groups[item.category]) {
			groups[item.category] = [];
		}
		groups[item.category].push(item);
	}
	return groups;
}
