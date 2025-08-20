import type { PageLoad } from './$types';

const FACETS = [
	{ taxo: 'countries', name: 'Countries', icon: 'icon-[mdi--earth]' },
	{
		taxo: 'nutrition-grades',
		name: 'Nutrition grades',
		icon: 'icon-[material-symbols--traffic-outline]'
	},
	{ taxo: 'nova-groups', name: 'NOVA groups', icon: 'icon-[mdi--numeric]' },
	{ taxo: 'environmental-score', name: 'Green-Score', icon: 'icon-[mdi--leaf]' },
	{ taxo: 'brands', name: 'Brands', icon: 'icon-[mdi--tag]' },
	{ taxo: 'categories', name: 'Categories', icon: 'icon-[mdi--shape]' },
	{ taxo: 'labels', name: 'Labels', icon: 'icon-[mdi--label]' },
	{ taxo: 'packaging', name: 'Packaging', icon: 'icon-[mdi--package]' },
	{
		taxo: 'origins',
		name: 'Origins of ingredients',
		icon: 'icon-[material-symbols--globe-location-pin]'
	},
	{
		taxo: 'manufacturing-places',
		name: 'Manufacturing or processing places',
		icon: 'icon-[mdi--factory]'
	},
	{ taxo: 'packager-codes', name: 'Traceability codes', icon: 'icon-[mdi--barcode]' },
	{ taxo: 'ingredients', name: 'Ingredients', icon: 'icon-[mdi--food-variant]' },
	{ taxo: 'additives', name: 'Additives', icon: 'icon-[mdi--flask]' },
	{ taxo: 'vitamins', name: 'Added vitamins', icon: 'icon-[mdi--pill]' },
	{ taxo: 'minerals', name: 'Added minerals', icon: 'icon-[mdi--diamond]' },
	{ taxo: 'amino-acids', name: 'Added amino acids', icon: 'icon-[mdi--molecule]' },
	{ taxo: 'nucleotides', name: 'Added nucleotides', icon: 'icon-[mdi--dna]' },
	{
		taxo: 'other-nutritional-substances',
		name: 'Other nutritional substances added',
		icon: 'icon-[mdi--plus-circle]'
	},
	{ taxo: 'allergens', name: 'Allergens', icon: 'icon-[mdi--alert]' },
	{ taxo: 'traces', name: 'Traces', icon: 'icon-[mdi--magnify]' },
	{ taxo: 'misc', name: 'Miscellaneous', icon: 'icon-[mdi--dots-horizontal]' },
	{ taxo: 'languages', name: 'Languages', icon: 'icon-[mdi--translate]' },
	{ taxo: 'contributors', name: 'Contributors', icon: 'icon-[mdi--account-group]' },
	{ taxo: 'states', name: 'States', icon: 'icon-[mdi--checkbox-marked]' },
	{ taxo: 'data-sources', name: 'Data sources', icon: 'icon-[mdi--database]' },
	{ taxo: 'entry-dates', name: 'Entry dates', icon: 'icon-[mdi--calendar-plus]' },
	{ taxo: 'last-edit-dates', name: 'Last edit dates', icon: 'icon-[mdi--calendar-edit]' },
	{ taxo: 'last-check-dates', name: 'Last check dates', icon: 'icon-[mdi--calendar-check]' },
	{ taxo: 'teams', name: 'Teams', icon: 'icon-[mdi--account-multiple]' }
];

export const load: PageLoad = async () => {
	return {
		facets: FACETS
	};
};
