import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getStaticPageContent, STATIC_PAGES_BASE_URL } from '#lib/api/staticPages.js';

// Text, headings and tables only, so they survive sanitizing intact
const NATIVE_PAGES = new Set([
	'privacy',
	'legal',
	'terms-of-use',
	'code-of-conduct',
	'who-we-are',
	'open-food-facts-vision-mission-values-and-programs',
	'discover',
	'contribute',
	'producers'
]);

// These run their own scripts (filters, search, forms), so they only work on the main site
const MAIN_SITE_PAGES = new Set(['data', 'faq', 'partners', 'presskit']);

export const load: PageLoad = async ({ fetch, params }) => {
	if (MAIN_SITE_PAGES.has(params.id)) {
		redirect(307, `${STATIC_PAGES_BASE_URL}/${params.id}`, { external: true });
	}
	if (!NATIVE_PAGES.has(params.id)) {
		return { content: null };
	}
	return { content: await getStaticPageContent(fetch, params.id) };
};
