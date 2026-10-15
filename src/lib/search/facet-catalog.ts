import type { Component, ComponentType } from 'svelte';
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

import { FACET_SEARCH_FIELDS } from './facet-fields';

export type FacetCatalogItem = {
	key: string;
	searchField?: string;
	labelKey: string;
	defaultLabel: string;
	category: 'General' | 'Nutrition & Health' | 'Packaging & Origin' | 'Community & Metadata';
	icon: Component | ComponentType;
	isFreeText?: boolean;
	placeholder?: string;
	placeholderKey?: string;
	defaultPlaceholder?: string;
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
		placeholderKey: 'facets.placeholders.origins',
		defaultPlaceholder: 'e.g. France, Spain...',
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
		placeholderKey: 'facets.placeholders.manufacturing_places',
		defaultPlaceholder: 'e.g. Lyon, Berlin...',
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
		placeholderKey: 'facets.placeholders.emb_codes',
		defaultPlaceholder: 'e.g. EMB 29007...',
		defaultVisible: true
	},
	{
		key: 'packaging',
		searchField: FACET_SEARCH_FIELDS['packaging'],
		labelKey: 'facets.packaging',
		defaultLabel: 'Packaging Material',
		category: 'Packaging & Origin',
		icon: IconMdiPackage,
		isFreeText: true,
		placeholder: 'e.g. glass, plastic...',
		placeholderKey: 'facets.placeholders.packaging',
		defaultPlaceholder: 'e.g. glass, plastic...',
		defaultVisible: false
	},
	{
		key: 'packaging_shapes',
		searchField: FACET_SEARCH_FIELDS['packaging_shapes'],
		labelKey: 'facets.packaging_shapes',
		defaultLabel: 'Packaging Shape',
		category: 'Packaging & Origin',
		icon: IconMdiShapeOutline,
		isFreeText: true,
		placeholder: 'e.g. bottle, box...',
		placeholderKey: 'facets.placeholders.packaging_shapes',
		defaultPlaceholder: 'e.g. bottle, box...',
		defaultVisible: false
	},
	{
		key: 'packaging_recycling',
		searchField: FACET_SEARCH_FIELDS['packaging_recycling'],
		labelKey: 'facets.packaging_recycling',
		defaultLabel: 'Packaging Recycling',
		category: 'Packaging & Origin',
		icon: IconMdiRecycle,
		isFreeText: true,
		placeholder: 'e.g. discard, recycle...',
		placeholderKey: 'facets.placeholders.packaging_recycling',
		defaultPlaceholder: 'e.g. discard, recycle...',
		defaultVisible: false
	},
	{
		key: 'ingredients',
		searchField: FACET_SEARCH_FIELDS['ingredients'],
		labelKey: 'facets.ingredients',
		defaultLabel: 'Ingredients',
		category: 'Nutrition & Health',
		icon: IconMdiFoodVariant,
		isFreeText: true,
		placeholder: 'e.g. sugar, water...',
		placeholderKey: 'facets.placeholders.ingredients',
		defaultPlaceholder: 'e.g. sugar, water...',
		defaultVisible: false
	},
	{
		key: 'ingredients_analysis',
		searchField: FACET_SEARCH_FIELDS['ingredients_analysis'],
		labelKey: 'facets.ingredients_analysis',
		defaultLabel: 'Ingredients Analysis (Palm Oil, Vegan...)',
		category: 'Nutrition & Health',
		icon: IconMdiSprout,
		isFreeText: true,
		placeholder: 'e.g. en:palm-oil-free, en:vegan...',
		placeholderKey: 'facets.placeholders.ingredients_analysis',
		defaultPlaceholder: 'e.g. en:palm-oil-free, en:vegan...',
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
		placeholderKey: 'facets.placeholders.traces',
		defaultPlaceholder: 'e.g. nuts, milk...',
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
		placeholderKey: 'facets.placeholders.vitamins',
		defaultPlaceholder: 'e.g. vitamin-c...',
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
		placeholderKey: 'facets.placeholders.minerals',
		defaultPlaceholder: 'e.g. calcium, iron...',
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
		placeholderKey: 'facets.placeholders.nucleotides',
		defaultPlaceholder: 'e.g. inosine...',
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
		placeholderKey: 'facets.placeholders.amino_acids',
		defaultPlaceholder: 'e.g. taurine, leucine...',
		defaultVisible: false
	},
	{
		key: 'other_nutritional_substances',
		searchField: FACET_SEARCH_FIELDS['other_nutritional_substances'],
		labelKey: 'facets.other_nutritional_substances',
		defaultLabel: 'Other Nutritional Substances',
		category: 'Nutrition & Health',
		icon: IconMdiPlusCircle,
		isFreeText: true,
		placeholder: 'e.g. polyphenols...',
		placeholderKey: 'facets.placeholders.other_nutritional_substances',
		defaultPlaceholder: 'e.g. polyphenols...',
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
		placeholderKey: 'facets.placeholders.states',
		defaultPlaceholder: 'e.g. ingredients-completed...',
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
		placeholderKey: 'facets.placeholders.data_quality_tags',
		defaultPlaceholder: 'e.g. packaging-data-complete...',
		defaultVisible: false
	},
	{
		key: 'data_quality_warnings',
		searchField: FACET_SEARCH_FIELDS['data_quality_warnings'],
		labelKey: 'facets.data_quality_warnings',
		defaultLabel: 'Data Quality Warnings',
		category: 'Community & Metadata',
		icon: IconMdiAlert,
		isFreeText: true,
		placeholder: 'e.g. warning tag...',
		placeholderKey: 'facets.placeholders.data_quality_warnings',
		defaultPlaceholder: 'e.g. warning tag...',
		defaultVisible: false
	},
	{
		key: 'data_quality_errors',
		searchField: FACET_SEARCH_FIELDS['data_quality_errors'],
		labelKey: 'facets.data_quality_errors',
		defaultLabel: 'Data Quality Errors',
		category: 'Community & Metadata',
		icon: IconMdiAlertOctagon,
		isFreeText: true,
		placeholder: 'e.g. error tag...',
		placeholderKey: 'facets.placeholders.data_quality_errors',
		defaultPlaceholder: 'e.g. error tag...',
		defaultVisible: false
	},
	{
		key: 'popularity_tags',
		searchField: FACET_SEARCH_FIELDS['popularity_tags'],
		labelKey: 'facets.popularity_tags',
		defaultLabel: 'Popularity',
		category: 'General',
		icon: IconMdiStar,
		isFreeText: true,
		placeholder: 'e.g. top-1000-fr...',
		placeholderKey: 'facets.placeholders.popularity_tags',
		defaultPlaceholder: 'e.g. top-1000-fr...',
		defaultVisible: false
	},
	{
		key: 'misc',
		searchField: FACET_SEARCH_FIELDS['misc'],
		labelKey: 'facets.misc',
		defaultLabel: 'Miscellaneous Tags',
		category: 'Community & Metadata',
		icon: IconMdiDotsHorizontal,
		isFreeText: true,
		placeholder: 'e.g. nutriscore-computed...',
		placeholderKey: 'facets.placeholders.misc',
		defaultPlaceholder: 'e.g. nutriscore-computed...',
		defaultVisible: false
	},
	{
		key: 'contributors',
		searchField: FACET_SEARCH_FIELDS['contributors'],
		labelKey: 'facets.contributors',
		defaultLabel: 'Creator / Contributor',
		category: 'Community & Metadata',
		icon: IconMdiAccountMultiple,
		isFreeText: true,
		placeholder: 'e.g. username...',
		placeholderKey: 'facets.placeholders.contributors',
		defaultPlaceholder: 'e.g. username...',
		defaultVisible: false
	},
	{
		key: 'owner',
		searchField: FACET_SEARCH_FIELDS['owner'],
		labelKey: 'facets.owner',
		defaultLabel: 'Brand Owner / Producer',
		category: 'Community & Metadata',
		icon: IconMdiDomain,
		isFreeText: true,
		placeholder: 'e.g. producer id...',
		placeholderKey: 'facets.placeholders.owner',
		defaultPlaceholder: 'e.g. producer id...',
		defaultVisible: false
	},
	{
		key: 'photographers',
		searchField: FACET_SEARCH_FIELDS['photographers'],
		labelKey: 'facets.photographers',
		defaultLabel: 'Photographers',
		category: 'Community & Metadata',
		icon: IconMdiCamera,
		isFreeText: true,
		placeholder: 'e.g. username...',
		placeholderKey: 'facets.placeholders.photographers',
		defaultPlaceholder: 'e.g. username...',
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
		placeholderKey: 'facets.placeholders.entry_dates',
		defaultPlaceholder: 'e.g. 2024-01...',
		defaultVisible: false
	}
];

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
