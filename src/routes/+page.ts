import type { PageLoad } from './$types';
import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';

export const load: PageLoad = async ({ fetch }) => {
	const off = new OpenFoodFacts(fetch);
	const attributeGroups = await off.getAttributeGroups();
	return { attributeGroups };
};
