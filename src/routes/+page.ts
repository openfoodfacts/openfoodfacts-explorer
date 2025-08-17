import type { PageLoad } from './$types';
import { getAttributeGroups as fetchAttributeGroups } from '$lib/api/attributes';
import { convertApiToAttributeGroups } from '$lib/preferenceUtils';

export const load: PageLoad = async ({ fetch }) => {
	const attributeGroupsPromise = fetchAttributeGroups(fetch).then(convertApiToAttributeGroups);
	const attributeGroups = await attributeGroupsPromise;
	return { attributeGroups };
};
