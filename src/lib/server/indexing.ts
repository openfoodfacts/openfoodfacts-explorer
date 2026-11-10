import type { Handle } from '@sveltejs/kit/hooks';

/*
 * Search engine indexing rules, ported from Product Opener so that Explorer keeps
 * the current site's crawler behaviour:
 * - crawler detection: `set_user_agent_request_ref_attributes` in ProductOpener::Display
 * - pages that must not be indexed: `is_no_index_page` in ProductOpener::Routing
 * - facets that may be indexed: `@index_tag_types` in ProductOpener::Config_off
 * - robots.txt: the file nginx serves on world.openfoodfacts.org
 */

// Known web crawlers. Matching is a prefix match, as in Product Opener.
const CRAWLER_PATTERN =
	/\b(GoogleOther|Googlebot|Googlebot-Image|Google-InspectionTool|bingbot|Applebot|Yandex|DuckDuck|DotBot|Seekport|Ahrefs|DataForSeo|Seznam|ZoomBot|Mojeek|QRbot|Qwant|facebookexternalhit|Bytespider|GPTBot|ChatGPT-User|cohere-ai|anthropic-ai|PerplexityBot|ClaudeBot|Claude-Web|SEOkicks|Searchmetrics|MJ12|SurveyBot|SEOdiver|wotbox|Cliqz|Paracrawl|Scrapy|VelenPublicWebCrawler|Semrush|MegaIndex\.ru|Amazon|aiohttp|python-request|ImagesiftBot|Diffbot|Timpibot|meta-webindexer|meta-externalagent)/i;

// Crawlers that are not allowed to index any page.
const DENIED_CRAWLER_PATTERN =
	/\b(bingbot|Seekport|Ahrefs|DataForSeo|Seznam|ZoomBot|Mojeek|QRbot|Bytespider|SEOkicks|Searchmetrics|MJ12|SurveyBot|SEOdiver|wotbox|Cliqz|Paracrawl|Scrapy|VelenPublicWebCrawler|Semrush|MegaIndex\.ru|YandexMarket|Amazon|GPTBot|ChatGPT-User|PerplexityBot|ClaudeBot|Claude-Web|cohere-ai|anthropic-ai|ImagesiftBot|Diffbot|Timpibot|meta-webindexer|meta-externalagent|Applebot)/i;

export type CrawlerKind = 'none' | 'allowed' | 'denied';

export function getCrawlerKind(userAgent: string | null): CrawlerKind {
	if (!userAgent || !CRAWLER_PATTERN.test(userAgent)) return 'none';
	return DENIED_CRAWLER_PATTERN.test(userAgent) ? 'denied' : 'allowed';
}

/** Only production deployments may be indexed, so previews and staging never reach search results. */
export function isIndexingAllowed(environment: string | undefined): boolean {
	return environment === 'production';
}

/**
 * Facets whose value pages may be indexed, using Explorer's URL names. Other facets are
 * left out because of their number of values (1.2M ingredients) or because they are about users.
 */
export const INDEXED_FACETS: ReadonlySet<string> = new Set([
	'brands',
	'categories',
	'labels',
	'additives',
	'nova-groups',
	'environmental-score',
	'nutrition-grades'
]);

// Personal, utility and search result pages, including their sub-routes.
const NOINDEX_ROUTES = [
	'/compare',
	'/folksonomy',
	'/loginrequired',
	'/oauth',
	'/products/[barcode]/edit',
	'/scan',
	'/search',
	'/settings',
	'/users'
];

const isRouteOrChild = (routeId: string, parent: string) =>
	routeId === parent || routeId.startsWith(`${parent}/`);

/** Whether search engines may index the page matched by `routeId`. Unmatched routes are left alone. */
export function isIndexable(
	routeId: string | null,
	params: Partial<Record<string, string>>,
	url: URL
): boolean {
	if (routeId === null) return true;
	if (NOINDEX_ROUTES.some((route) => isRouteOrChild(routeId, route))) return false;

	if (isRouteOrChild(routeId, '/facets')) {
		// Lists of tags and nested facets are never indexed, and a facet value
		// is indexed only once, on its first page.
		const page = Number(url.searchParams.get('page') ?? '1');
		return (
			routeId === '/facets/[facet]/[value]' &&
			INDEXED_FACETS.has(params.facet ?? '') &&
			!(page >= 2)
		);
	}

	return true;
}

/** Served to crawlers instead of pages they must not index, without loading any data. */
export const NOINDEX_HTML =
	'<!DOCTYPE html><html lang="en"><head><meta name="robots" content="noindex"></head><body><h1>NOINDEX</h1><p>We detected that your browser is a web crawling bot, and this page should not be indexed by web crawlers. If this is unexpected, contact us on Slack or write us an email at <a href="mailto:contact@openfoodfacts.org">contact@openfoodfacts.org</a>.</p></body></html>';

export const DENY_ALL_ROBOTS_TXT = 'User-agent: *\nDisallow: /\n';

// Explorer pages that are personal or have no content worth crawling.
const PRIVATE_PATHS = [
	'/compare',
	'/loginrequired',
	'/oauth',
	'/products/*/edit',
	'/scan',
	'/search',
	'/settings'
];

// Crawlers blocked from the whole site in the current robots.txt.
const DENIED_ROBOTS = [
	'meta-externalagent',
	'meta-webindexer',
	'Applebot',
	'SEOkicks-Robot',
	'DotBot',
	'SearchmetricsBot',
	'MJ12bot',
	'SurveyBot',
	'SEOdiver',
	'spbot',
	'wotbox',
	'Cliqzbot',
	'SeekportBot',
	'Seekport',
	'Paracrawl',
	'Scrapy',
	'VelenPublicWebCrawler',
	'SemrushBot',
	'MegaIndex.ru',
	'YandexMarket',
	'YandexBot',
	'Amazonbot',
	'DataForSeoBot',
	'AhrefsBot',
	'GPTBot',
	'cohere-ai',
	'anthropic-ai',
	'ClaudeBot',
	'Claude-Web',
	'PerplexityBot',
	'Diffbot',
	'ImagesiftBot',
	'ChatGPT-User',
	'OAI-SearchBot',
	'AliyunSecBot',
	'YisouSpider'
];

const robotsGroup = (userAgents: string[], rules: string[]) =>
	[...userAgents.map((agent) => `User-agent: ${agent}`), ...rules].join('\n');

const disallow = (paths: string[]) => paths.map((path) => `Disallow: ${path}`);
const allow = (paths: string[]) => paths.map((path) => `Allow: ${path}`);

// Product Opener image and OpenSearch endpoints stay crawlable for Google and Bing.
const ALLOWED_CGI = ['/cgi/product_image.pl', '/cgi/opensearch.pl'];

/**
 * Only Googlebot may crawl facet pages, where non-indexed facets get a noindex page.
 * /api and /cgi are served by Product Opener on the same domain.
 */
export const ROBOTS_TXT =
	[
		robotsGroup(['*'], disallow(['/api', '/cgi', '/facets', ...PRIVATE_PATHS])),
		robotsGroup(
			['Googlebot'],
			[...disallow(['/api', '/cgi', ...PRIVATE_PATHS]), ...allow(ALLOWED_CGI)]
		),
		robotsGroup(
			['Bingbot'],
			[...disallow(['/api', '/cgi', '/facets', ...PRIVATE_PATHS]), ...allow(ALLOWED_CGI)]
		),
		robotsGroup(DENIED_ROBOTS, ['Disallow: /'])
	].join('\n\n') + '\n';

export function getRobotsTxt(userAgent: string | null, indexingAllowed: boolean): string {
	if (!indexingAllowed || getCrawlerKind(userAgent) === 'denied') return DENY_ALL_ROBOTS_TXT;
	return ROBOTS_TXT;
}

function noindexResponse(): Response {
	return new Response(NOINDEX_HTML, {
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'x-robots-tag': 'noindex',
			// The same URL renders normally for people, so this response must not be cached.
			'cache-control': 'no-store',
			vary: 'user-agent'
		}
	});
}

/**
 * Marks pages that must not be indexed with `X-Robots-Tag: noindex`, and serves crawlers a
 * noindex page instead of rendering them, which also spares the APIs behind those pages.
 */
export function createIndexingHandle(indexingAllowed: boolean): Handle {
	return async ({ event, resolve }) => {
		if (event.isDataRequest || event.isSubRequest || event.route.id === '/robots.txt') {
			return resolve(event);
		}

		const indexable = isIndexable(event.route.id, event.params, event.url);
		const crawler = getCrawlerKind(event.request.headers.get('user-agent'));
		if (crawler === 'denied' || (crawler === 'allowed' && !indexable)) {
			return noindexResponse();
		}

		const response = await resolve(event);
		if (!indexingAllowed || !indexable) {
			response.headers.set('x-robots-tag', 'noindex');
		}
		return response;
	};
}
