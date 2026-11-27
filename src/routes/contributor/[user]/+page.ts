import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { resolveForUrl } from '#lib/paths.js';

export const load: PageLoad = async ({ params, url }) => {
	const { user } = params;

	redirect(
		301,
		`${resolveForUrl(url, '/facets/[facet]/[value]', { facet: 'contributors', value: user })}${url.search}`
	);
};
