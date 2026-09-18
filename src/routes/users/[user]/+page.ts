import { getFacetValue } from '$lib/api/facets';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const { user } = params;
	const encodedUser = encodeURIComponent(user);

	const fallback = { count: 0, products: [], page: 1, page_size: 50 };

	const contributorResponse = getFacetValue(fetch, 'contributors', encodedUser, {}).catch((e) => {
		console.error(`Unable to load "contributors" facet for user "${user}":`, e);
		return fallback as any;
	});
	const editorResponse = getFacetValue(fetch, 'editors', encodedUser, {}).catch((e) => {
		console.error(`Unable to load "editors" facet for user "${user}":`, e);
		return fallback as any;
	});
	const photographerResponse = getFacetValue(fetch, 'photographers', encodedUser, {}).catch((e) => {
		console.error(`Unable to load "photographers" facet for user "${user}":`, e);
		return fallback as any;
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
