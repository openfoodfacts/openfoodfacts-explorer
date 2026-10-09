import type { Facet } from '#lib/api/search.js';
import type { FacetsSelection } from './facet-selection';
import {
	MASTER_FACET_CATALOG,
	DEFAULT_FREE_TEXT_FACETS,
	KNOWN_AGGREGATED_FACETS,
	type FacetCatalogItem
} from './facet-catalog';

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
