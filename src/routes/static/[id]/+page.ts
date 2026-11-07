import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { getStaticPageContent, getStaticPageUrl } from '#lib/api/staticPages.js';
import { getLocaleForUrl } from '#lib/i18n/index.js';
import { getLanguageCode } from '#lib/settings.js';

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

export const load: PageLoad = async ({ fetch, params, url }) => {
	const language = getLanguageCode(getLocaleForUrl(url));
	if (MAIN_SITE_PAGES.has(params.id)) {
		redirect(307, getStaticPageUrl(params.id, language).href, { external: true });
	}
	if (!NATIVE_PAGES.has(params.id)) {
		return { content: null, language };
	}
	return { content: await getStaticPageContent(fetch, params.id, language), language };
};
