import type { PageLoad } from './$types';
import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';

export const load: PageLoad = async ({ fetch }) => {
	const off = new OpenFoodFacts(fetch);
	const { data: attributeGroups, error } = await off.getAttributeGroups();
	if (error || !attributeGroups) {
		console.warn('Error fetching attribute groups:', error);
	}

	return { attributeGroups };
};
