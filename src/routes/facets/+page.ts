import type { PageLoad } from './$types';

import IconMdiEarth from '@iconify-svelte/mdi/earth';
import IconMaterialTrafficOutline from '@iconify-svelte/material-symbols/traffic-outline';
import IconMdiNumeric from '@iconify-svelte/mdi/numeric';
import IconMdiLeaf from '@iconify-svelte/mdi/leaf';
import IconMdiTag from '@iconify-svelte/mdi/tag';
import IconMdiShape from '@iconify-svelte/mdi/shape';
import IconMdiLabel from '@iconify-svelte/mdi/label';
import IconMdiPackage from '@iconify-svelte/mdi/package';
import IconMaterialGlobeLocationPin from '@iconify-svelte/material-symbols/globe-location-pin';
import IconMdiFactory from '@iconify-svelte/mdi/factory';
import IconMdiBarcode from '@iconify-svelte/mdi/barcode';
import IconMdiFoodVariant from '@iconify-svelte/mdi/food-variant';
import IconMdiFlask from '@iconify-svelte/mdi/flask';
import IconMdiPill from '@iconify-svelte/mdi/pill';
import IconMdiDiamond from '@iconify-svelte/mdi/diamond';
import IconMdiMolecule from '@iconify-svelte/mdi/molecule';
import IconMdiDna from '@iconify-svelte/mdi/dna';
import IconMdiPlusCircle from '@iconify-svelte/mdi/plus-circle';
import IconMdiAlert from '@iconify-svelte/mdi/alert';
import IconMdiMagnify from '@iconify-svelte/mdi/magnify';
import IconMdiDotsHorizontal from '@iconify-svelte/mdi/dots-horizontal';
import IconMdiTranslate from '@iconify-svelte/mdi/translate';
import IconMdiAccountGroup from '@iconify-svelte/mdi/account-group';
import IconMdiCheckboxMarked from '@iconify-svelte/mdi/checkbox-marked';
import IconMdiDatabase from '@iconify-svelte/mdi/database';
import IconMdiCalendarPlus from '@iconify-svelte/mdi/calendar-plus';
import IconMdiCalendarEdit from '@iconify-svelte/mdi/calendar-edit';
import IconMdiCalendarCheck from '@iconify-svelte/mdi/calendar-check';
import IconMdiAccountMultiple from '@iconify-svelte/mdi/account-multiple';

const FACETS = [
	{ taxo: 'countries', name: 'Countries', icon: IconMdiEarth },
	{ taxo: 'nutrition-grades', name: 'Nutrition grades', icon: IconMaterialTrafficOutline },
	{ taxo: 'nova-groups', name: 'NOVA groups', icon: IconMdiNumeric },
	{ taxo: 'environmental-score', name: 'Green-Score', icon: IconMdiLeaf },
	{ taxo: 'brands', name: 'Brands', icon: IconMdiTag },
	{ taxo: 'categories', name: 'Categories', icon: IconMdiShape },
	{ taxo: 'labels', name: 'Labels', icon: IconMdiLabel },
	{ taxo: 'packaging', name: 'Packaging', icon: IconMdiPackage },
	{ taxo: 'origins', name: 'Origins of ingredients', icon: IconMaterialGlobeLocationPin },
	{
		taxo: 'manufacturing-places',
		name: 'Manufacturing or processing places',
		icon: IconMdiFactory
	},
	{ taxo: 'packager-codes', name: 'Traceability codes', icon: IconMdiBarcode },
	{ taxo: 'ingredients', name: 'Ingredients', icon: IconMdiFoodVariant },
	{ taxo: 'additives', name: 'Additives', icon: IconMdiFlask },
	{ taxo: 'vitamins', name: 'Added vitamins', icon: IconMdiPill },
	{ taxo: 'minerals', name: 'Added minerals', icon: IconMdiDiamond },
	{ taxo: 'amino-acids', name: 'Added amino acids', icon: IconMdiMolecule },
	{ taxo: 'nucleotides', name: 'Added nucleotides', icon: IconMdiDna },
	{
		taxo: 'other-nutritional-substances',
		name: 'Other nutritional substances added',
		icon: IconMdiPlusCircle
	},
	{ taxo: 'allergens', name: 'Allergens', icon: IconMdiAlert },
	{ taxo: 'traces', name: 'Traces', icon: IconMdiMagnify },
	{ taxo: 'misc', name: 'Miscellaneous', icon: IconMdiDotsHorizontal },
	{ taxo: 'languages', name: 'Languages', icon: IconMdiTranslate },
	{ taxo: 'contributors', name: 'Contributors', icon: IconMdiAccountGroup },
	{ taxo: 'states', name: 'States', icon: IconMdiCheckboxMarked },
	{ taxo: 'data-sources', name: 'Data sources', icon: IconMdiDatabase },
	{ taxo: 'entry-dates', name: 'Entry dates', icon: IconMdiCalendarPlus },
	{ taxo: 'last-edit-dates', name: 'Last edit dates', icon: IconMdiCalendarEdit },
	{ taxo: 'last-check-dates', name: 'Last check dates', icon: IconMdiCalendarCheck },
	{ taxo: 'teams', name: 'Teams', icon: IconMdiAccountMultiple }
];

export const load: PageLoad = async () => {
	return {
		facets: FACETS
	};
};
