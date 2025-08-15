import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';

export const getAttributeGroups = async (fetch: typeof window.fetch) => {
	const off = new OpenFoodFacts(fetch);
	const attributeGroups = await off.getAttributeGroups();
	return attributeGroups;
};
