import { getFacetValue } from '$lib/api/facets';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const { user } = params;
	const encodedUser = encodeURIComponent(user);

	const contributorResponse = getFacetValue(fetch, 'contributors', encodedUser, {}).catch(() => null);
	const editorResponse = getFacetValue(fetch, 'editors', encodedUser, {}).catch(() => null);

	const [contributorData, editorData] = await Promise.all([contributorResponse, editorResponse]);

	return {
		user,
		contributor: contributorData,
		editor: editorData
	};
};
