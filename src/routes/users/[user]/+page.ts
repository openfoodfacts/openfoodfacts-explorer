import { getFacetValue } from '$lib/api/facets';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const { user } = params;
	const encodedUser = encodeURIComponent(user);

	const contributorResponse = getFacetValue(fetch, 'contributors', encodedUser, {})
		.then((data) => ({ data, available: true as const, error: null as string | null }))
		.catch((error) => ({
			data: null,
			available: false as const,
			error: error instanceof Error ? error.message : String(error)
		}));

	const editorResponse = getFacetValue(fetch, 'editors', encodedUser, {})
		.then((data) => ({ data, available: true as const, error: null as string | null }))
		.catch((error) => ({
			data: null,
			available: false as const,
			error: error instanceof Error ? error.message : String(error)
		}));

	const [contributorResult, editorResult] = await Promise.all([contributorResponse, editorResponse]);

	return {
		user,
		contributor: contributorResult.data,
		editor: editorResult.data,
		contributorAvailable: contributorResult.available,
		editorAvailable: editorResult.available,
		contributorError: contributorResult.error,
		editorError: editorResult.error
	};
};
