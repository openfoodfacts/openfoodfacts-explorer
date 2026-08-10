import { getFacetValue } from '$lib/api/facets';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const { user } = params;
	const encodedUser = encodeURIComponent(user);

	const contributorResponse = getFacetValue(fetch, 'contributors', encodedUser, {}).catch(() => {
		error(500, `Unable to load "contributors" facet for user "${user}"`);
	});
	const editorResponse = getFacetValue(fetch, 'editors', encodedUser, {}).catch(() => {
		error(500, `Unable to load "editors" facet for user "${user}"`);
	});
	const photographerResponse = getFacetValue(fetch, 'photographers', encodedUser, {}).catch(() => {
		error(500, `Unable to load "photographers" facet for user "${user}"`);
	});

	const [contributorData, editorData, photographerData] = await Promise.all([
		contributorResponse,
		editorResponse,
		photographerResponse
	]);

	return {
		user,
		contributor: contributorData,
		editor: editorData,
		photographer: photographerData
	};
};
