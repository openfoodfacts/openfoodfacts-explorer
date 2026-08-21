import type { Component, ComponentType } from 'svelte';
import type { Facet } from '$lib/api/search';
import IconMaterialGlobeLocationPin from '@iconify-svelte/material-symbols/globe-location-pin';
import IconMaterialTrafficOutline from '@iconify-svelte/material-symbols/traffic-outline';
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
import IconMdiLeaf from '@iconify-svelte/mdi/leaf';
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
		category: 'Nutrition & Health',
		icon: IconMdiCheckboxMarked,
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
		category: 'Community & Metadata',
		icon: IconMdiTranslate,
		defaultVisible: true
	},
	{
		key: 'origins',
		labelKey: 'facets.origins',
		defaultLabel: 'Origins of ingredients',
		category: 'Packaging & Origin',
		icon: IconMaterialGlobeLocationPin,
		isFreeText: true,
		placeholder: 'e.g. France, Spain...',
		defaultVisible: true
	},
	{
		key: 'manufacturing_places',
		labelKey: 'facets.manufacturing_places',
		defaultLabel: 'Manufacturing places',
		category: 'Packaging & Origin',
		icon: IconMdiFactory,
		isFreeText: true,
		placeholder: 'e.g. Lyon, Berlin...',
		defaultVisible: true
	},
	{
		key: 'emb_codes',
		labelKey: 'facets.emb_codes',
		defaultLabel: 'Traceability / EMB codes',
		category: 'Packaging & Origin',
		icon: IconMdiBarcode,
		isFreeText: true,
		placeholder: 'e.g. EMB 29007...',
		defaultVisible: true
	},
	{
		key: 'packaging',
		searchField: 'packagings.material',
		labelKey: 'facets.packaging',
		defaultLabel: 'Packaging Material',
		category: 'Packaging & Origin',
		icon: IconMdiPackage,
		isFreeText: true,
		placeholder: 'e.g. glass, plastic...',
		defaultVisible: false
	},
	{
		key: 'packaging_shapes',
		searchField: 'packagings.shape',
		labelKey: 'facets.packaging_shapes',
		defaultLabel: 'Packaging Shape',
		category: 'Packaging & Origin',
		icon: IconMdiShapeOutline,
		isFreeText: true,
		placeholder: 'e.g. bottle, box...',
		defaultVisible: false
	},
	{
		key: 'packaging_recycling',
		searchField: 'packagings.recycling',
		labelKey: 'facets.packaging_recycling',
		defaultLabel: 'Packaging Recycling',
		category: 'Packaging & Origin',
		icon: IconMdiRecycle,
		isFreeText: true,
		placeholder: 'e.g. discard, recycle...',
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
		placeholder: 'e.g. sugar, water...',
		defaultVisible: false
	},
	{
		key: 'ingredients_analysis',
		searchField: 'ingredients_analysis',
		labelKey: 'facets.ingredients_analysis',
		defaultLabel: 'Ingredients Analysis (Palm Oil, Vegan...)',
		category: 'Nutrition & Health',
		icon: IconMdiSprout,
		isFreeText: true,
		placeholder: 'e.g. en:palm-oil-free, en:vegan...',
		defaultVisible: false
	},
	{
		key: 'traces',
		labelKey: 'facets.traces',
		defaultLabel: 'Traces',
		category: 'Nutrition & Health',
		icon: IconMdiAlert,
		isFreeText: true,
		placeholder: 'e.g. nuts, milk...',
		defaultVisible: false
	},
	{
		key: 'vitamins',
		labelKey: 'facets.vitamins',
		defaultLabel: 'Vitamins',
		category: 'Nutrition & Health',
		icon: IconMdiPill,
		isFreeText: true,
		placeholder: 'e.g. vitamin-c...',
		defaultVisible: false
	},
	{
		key: 'minerals',
		labelKey: 'facets.minerals',
		defaultLabel: 'Minerals',
		category: 'Nutrition & Health',
		icon: IconMdiDiamond,
		isFreeText: true,
		placeholder: 'e.g. calcium, iron...',
		defaultVisible: false
	},
	{
		key: 'nucleotides',
		labelKey: 'facets.nucleotides',
		defaultLabel: 'Nucleotides',
		category: 'Nutrition & Health',
		icon: IconMdiDna,
		isFreeText: true,
		placeholder: 'e.g. inosine...',
		defaultVisible: false
	},
	{
		key: 'amino_acids',
		labelKey: 'facets.amino_acids',
		defaultLabel: 'Amino Acids',
		category: 'Nutrition & Health',
		icon: IconMdiMolecule,
		isFreeText: true,
		placeholder: 'e.g. taurine, leucine...',
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
		placeholder: 'e.g. polyphenols...',
		defaultVisible: false
	},
	{
		key: 'states',
		labelKey: 'facets.states',
		defaultLabel: 'Data Completion States',
		category: 'Community & Metadata',
		icon: IconMdiDatabase,
		isFreeText: true,
		placeholder: 'e.g. ingredients-completed...',
		defaultVisible: false
	},
	{
		key: 'data_quality_tags',
		labelKey: 'facets.data_quality_tags',
		defaultLabel: 'Data Quality Tags',
		category: 'Community & Metadata',
		icon: IconMdiAlertCircle,
		isFreeText: true,
		placeholder: 'e.g. packaging-data-complete...',
		defaultVisible: false
	},
	{
		key: 'data_quality_warnings',
		searchField: 'data_quality_warnings',
		labelKey: 'facets.data_quality_warnings',
		defaultLabel: 'Data Quality Warnings',
		category: 'Community & Metadata',
		icon: IconMdiAlert,
		isFreeText: true,
		placeholder: 'e.g. warning tag...',
		defaultVisible: false
	},
	{
		key: 'data_quality_errors',
		searchField: 'data_quality_errors_tags',
		labelKey: 'facets.data_quality_errors',
		defaultLabel: 'Data Quality Errors',
		category: 'Community & Metadata',
		icon: IconMdiAlertOctagon,
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
	},
	{
		key: 'misc',
		searchField: 'misc_tags',
		labelKey: 'facets.misc',
		defaultLabel: 'Miscellaneous Tags',
		category: 'Community & Metadata',
		icon: IconMdiDotsHorizontal,
		isFreeText: true,
		placeholder: 'e.g. nutriscore-computed...',
		defaultVisible: false
	},
	{
		key: 'contributors',
		searchField: 'creator',
		labelKey: 'facets.contributors',
		defaultLabel: 'Creator / Contributor',
		category: 'Community & Metadata',
		icon: IconMdiAccountMultiple,
		isFreeText: true,
		placeholder: 'e.g. username...',
		defaultVisible: false
	},
	{
		key: 'owner',
		searchField: 'owner',
		labelKey: 'facets.owner',
		defaultLabel: 'Brand Owner / Producer',
		category: 'Community & Metadata',
		icon: IconMdiDomain,
		isFreeText: true,
		placeholder: 'e.g. producer id...',
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
		key: 'entry_dates',
		labelKey: 'facets.entry_dates',
		defaultLabel: 'Entry Dates (YYYY-MM)',
		category: 'Community & Metadata',
		icon: IconMdiDatabase,
		isFreeText: true,
		placeholder: 'e.g. 2024-01...',
		defaultVisible: false
	}
];

const FACET_KEY_TO_SEARCH_FIELD_MAP = new Map<string, string>();
const SEARCH_FIELD_TO_FACET_KEY_MAP = new Map<string, string>();

for (const item of MASTER_FACET_CATALOG) {
	if (item.searchField) {
		FACET_KEY_TO_SEARCH_FIELD_MAP.set(item.key, item.searchField);
		SEARCH_FIELD_TO_FACET_KEY_MAP.set(item.searchField, item.key);
	}
	SEARCH_FIELD_TO_FACET_KEY_MAP.set(item.key, item.key);
}

export function getSearchFieldForFacet(facetKey: string): string {
	return FACET_KEY_TO_SEARCH_FIELD_MAP.get(facetKey) || facetKey;
}

export function getFacetKeyForSearchField(searchField: string): string {
	return SEARCH_FIELD_TO_FACET_KEY_MAP.get(searchField) || searchField;
}

export const DEFAULT_VISIBLE_FACET_KEYS = MASTER_FACET_CATALOG.filter((f) => f.defaultVisible).map(
	(f) => f.key
);

export const KNOWN_AGGREGATED_FACETS: string[] = MASTER_FACET_CATALOG.filter(
	(f) => f.defaultVisible && !f.isFreeText
).map((f) => f.key);

export const DEFAULT_FREE_TEXT_FACETS: FacetCatalogItem[] = MASTER_FACET_CATALOG.filter(
	(f) => f.isFreeText && f.defaultVisible
);

export const FACET_CATEGORY_LABELS: Record<
	FacetCatalogItem['category'],
	{ labelKey: string; defaultLabel: string }
> = {
	General: { labelKey: 'facets.category_general', defaultLabel: 'General' },
	'Nutrition & Health': {
		labelKey: 'facets.category_nutrition',
		defaultLabel: 'Nutrition & Health'
	},
	'Packaging & Origin': {
		labelKey: 'facets.category_packaging',
		defaultLabel: 'Packaging & Origin'
	},
	'Community & Metadata': {
		labelKey: 'facets.category_community',
		defaultLabel: 'Community & Metadata'
	}
};

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

export interface FacetCollections {
	allFreeTextFacets: FacetCatalogItem[];
	allAggregatedFacets: Record<string, Facet>;
	activeFacetKeys: string[];
	availableCatalogFacets: FacetCatalogItem[];
	filteredCatalogFacets: FacetCatalogItem[];
	groupedCatalogFacets: Record<string, FacetCatalogItem[]>;
}

export function computeFacetCollections(
	facets: Record<string, Facet> = {},
	selectedFacets: FacetsSelection = {},
	customFacetKeys: string[] = [],
	searchQuery: string = '',
	translate?: (key: string, options?: { default?: string }) => string
): FacetCollections {
	const allFreeTextFacets = [...DEFAULT_FREE_TEXT_FACETS];
	for (const key of customFacetKeys) {
		const catalogItem = MASTER_FACET_CATALOG.find((f) => f.key === key);
		if (catalogItem?.isFreeText && !allFreeTextFacets.some((f) => f.key === key)) {
			allFreeTextFacets.push(catalogItem);
		}
	}
	for (const [key, sel] of Object.entries(selectedFacets)) {
		if ((sel?.include?.length ?? 0) > 0 || (sel?.exclude?.length ?? 0) > 0) {
			const catalogItem = MASTER_FACET_CATALOG.find((f) => f.key === key);
			if (catalogItem?.isFreeText && !allFreeTextFacets.some((f) => f.key === key)) {
				allFreeTextFacets.push(catalogItem);
			}
		}
	}

	const allAggregatedFacets: Record<string, Facet> = {
		...(facets || {})
	};

	for (const key of KNOWN_AGGREGATED_FACETS) {
		if (!allAggregatedFacets[key]) {
			allAggregatedFacets[key] = {
				name: key,
				items: [],
				count_error_margin: 0
			};
		}
	}

	for (const key of customFacetKeys) {
		const catalogItem = MASTER_FACET_CATALOG.find((f) => f.key === key);
		if (!catalogItem?.isFreeText && !allAggregatedFacets[key]) {
			allAggregatedFacets[key] = {
				name: key,
				items: [],
				count_error_margin: 0
			};
		}
	}

	for (const [key, sel] of Object.entries(selectedFacets)) {
		if ((sel?.include?.length ?? 0) > 0 || (sel?.exclude?.length ?? 0) > 0) {
			if (!allFreeTextFacets.some((f) => f.key === key) && !allAggregatedFacets[key]) {
				allAggregatedFacets[key] = {
					name: key,
					items: [],
					count_error_margin: 0
				};
			}
		}
	}

	const activeKeysSet = new Set<string>();
	for (const key of Object.keys(allAggregatedFacets)) {
		activeKeysSet.add(key);
	}
	for (const f of allFreeTextFacets) {
		activeKeysSet.add(f.key);
	}
	for (const key of Object.keys(selectedFacets)) {
		activeKeysSet.add(key);
	}
	const activeFacetKeys = Array.from(activeKeysSet);

	const availableCatalogFacets = MASTER_FACET_CATALOG.filter((f) => !activeKeysSet.has(f.key));

	const q = searchQuery.toLowerCase().trim();
	const filteredCatalogFacets = !q
		? availableCatalogFacets
		: availableCatalogFacets.filter((f) => {
				const label = translate
					? translate(f.labelKey, { default: f.defaultLabel })
					: f.defaultLabel;
				return (
					f.defaultLabel.toLowerCase().includes(q) ||
					label.toLowerCase().includes(q) ||
					f.category.toLowerCase().includes(q) ||
					f.key.toLowerCase().includes(q)
				);
			});

	const groupedCatalogFacets = groupCatalogFacets(filteredCatalogFacets);

	return {
		allFreeTextFacets,
		allAggregatedFacets,
		activeFacetKeys,
		availableCatalogFacets,
		filteredCatalogFacets,
		groupedCatalogFacets
	};
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
		let trimmed = part.trim();
		if (!trimmed) continue;

		while (trimmed.startsWith('(') && trimmed.endsWith(')')) {
			trimmed = trimmed.slice(1, -1).trim();
		}

		const subParts = trimmed.includes(':') ? [trimmed] : [];
		for (const subPart of subParts) {
			const cleanSub = subPart.trim().replace(/^\(+/, '');
			const isExclude = cleanSub.startsWith('-');
			const cleanPart = isExclude ? cleanSub.slice(1) : cleanSub;

			const colonIdx = cleanPart.indexOf(':');
			if (colonIdx === -1) continue;

			const rawFacet = cleanPart.slice(0, colonIdx).trim().replace(/^\(+/, '');
			const facet = getFacetKeyForSearchField(rawFacet);
			let valExpr = cleanPart.slice(colonIdx + 1).trim();

			if (!facet || !valExpr) continue;

			while (valExpr.startsWith('(') && valExpr.endsWith(')')) {
				valExpr = valExpr.slice(1, -1).trim();
			}
			valExpr = valExpr.replace(/\)+$/, '').trim();

			const values = splitOutsideQuotes(valExpr, /^\s+OR\s+/i)
				.map((v) =>
					v
						.trim()
						.replace(/^\(+|\)+$/g, '')
						.replace(/^"+|"+$/g, '')
				)
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
	}

	return sel;
}
