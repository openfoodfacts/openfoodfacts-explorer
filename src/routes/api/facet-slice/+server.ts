import { error, json } from '@sveltejs/kit';
import { PUBLIC_QUERY_BASE_URL } from '$app/env/public';
import { getFacetPairs } from '#lib/api/facets.js';
import { getQueryFilter, queryTopFacetValues } from '#lib/server/query-facets.js';
import { SLICE_FACETS } from '#lib/ui/facets/facet-links.js';
import { toFacetResults } from '../../facets/[facet]/facet-results';
import type { RequestHandler } from './$types';

const VALUES_PER_FACET = 8;

/**
 * The top values of a few facets for the products of a facet page, for the "Slice by" menu.
 * Takes the page's pairs as `path`, e.g. ?path=brands/ferrero/labels/en:organic&lang=en
 */
export const GET: RequestHandler = async ({ fetch, url }) => {
	const parts = (url.searchParams.get('path') ?? '').split('/');
	if (parts.length < 2) error(400, 'Invalid facet path');
	const pairs = getFacetPairs(parts[0], parts[1], parts.slice(2).join('/'));
	if (pairs == null) error(400, 'Invalid facet path');

	const filter = getQueryFilter(pairs);
	if (filter == null) error(404, 'Unknown facet');
	const lang = url.searchParams.get('lang') ?? 'en';

	const facets = SLICE_FACETS.filter((facet) => !pairs.some((pair) => pair.facet === facet));
	const groups = await Promise.all(
		facets.map(async (facet) => {
			try {
				const values = await queryTopFacetValues(
					fetch,
					PUBLIC_QUERY_BASE_URL,
					facet,
					VALUES_PER_FACET,
					filter
				);
				if (values == null) return null;
				const results = await toFacetResults(fetch, facet, { count: values.length, values }, lang);
				return { facet, tags: results.tags };
			} catch (e) {
				console.error(`Slice values failed for ${facet}:`, e);
				return null;
			}
		})
	);

	return json({ groups: groups.filter((group) => group != null && group.tags.length > 0) });
};
