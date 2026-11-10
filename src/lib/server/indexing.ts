import type { Handle } from '@sveltejs/kit/hooks';

/*
 * Search engine indexing rules, ported from Product Opener so that Explorer keeps
 * the current site's crawler behaviour:
 * - crawler detection: `set_user_agent_request_ref_attributes` in ProductOpener::Display
 * - pages that must not be indexed: `is_no_index_page` in ProductOpener::Routing
 * - facets that may be indexed: `@index_tag_types` in ProductOpener::Config_off
 * - robots.txt: the file nginx serves on world.openfoodfacts.org
 *
 * Product Opener lists denied crawlers twice, in robots.txt and in its User-Agent check, and the
 * two lists disagree. Explorer denies the crawlers of both, from the single `DENIED_CRAWLERS` list.
 */

type DeniedCrawler = {
	/** The crawler's product token, which names it in robots.txt. */
	token: string;
	/** How its User-Agent name starts, when that is broader than the token. Defaults to the token. */
	userAgent?: string;
};

/**
 * Crawlers that may not crawl or index any page. This one list builds both their robots.txt group
 * (`Disallow: /`) and the User-Agent check that serves them the NOINDEX page, so the two cannot
 * drift apart.
 */
export const DENIED_CRAWLERS: readonly DeniedCrawler[] = [
	{ token: 'AhrefsBot', userAgent: 'Ahrefs' },
	{ token: 'AliyunSecBot' },
	{ token: 'Amazonbot', userAgent: 'Amazon' },
	{ token: 'anthropic-ai' },
	{ token: 'Applebot' },
	// Product Opener's robots.txt gives Bingbot its own group, but its User-Agent check denies it,
	// so Bing gets the NOINDEX page on every URL of the current site.
	{ token: 'Bingbot' },
	{ token: 'Bytespider' },
	{ token: 'ChatGPT-User' },
	{ token: 'Claude-Web' },
	{ token: 'ClaudeBot' },
	{ token: 'Cliqzbot', userAgent: 'Cliqz' },
	{ token: 'cohere-ai' },
	{ token: 'DataForSeoBot', userAgent: 'DataForSeo' },
	{ token: 'Diffbot' },
	{ token: 'DotBot' },
	{ token: 'GPTBot' },
	{ token: 'ImagesiftBot' },
	{ token: 'MegaIndex.ru' },
	{ token: 'meta-externalagent' },
	{ token: 'meta-webindexer' },
	{ token: 'MJ12bot', userAgent: 'MJ12' },
	{ token: 'MojeekBot', userAgent: 'Mojeek' },
	{ token: 'OAI-SearchBot' },
	{ token: 'Paracrawl' },
	{ token: 'PerplexityBot' },
	{ token: 'QRbot' },
	{ token: 'Scrapy' },
	{ token: 'SearchmetricsBot', userAgent: 'Searchmetrics' },
	{ token: 'Seekport' },
	{ token: 'SeekportBot', userAgent: 'Seekport' },
	{ token: 'SemrushBot', userAgent: 'Semrush' },
	{ token: 'SEOdiver' },
	{ token: 'SEOkicks-Robot', userAgent: 'SEOkicks' },
	{ token: 'SeznamBot', userAgent: 'Seznam' },
	{ token: 'spbot' },
	{ token: 'SurveyBot' },
	{ token: 'Timpibot' },
	{ token: 'VelenPublicWebCrawler' },
	{ token: 'wotbox' },
	{ token: 'YandexBot' },
	{ token: 'YandexMarket' },
	{ token: 'YisouSpider' },
	{ token: 'ZoomBot' }
];

/**
 * Crawlers that may index the pages `isIndexable` allows, by how their User-Agent name starts.
 * They follow the `*` group of robots.txt, except Googlebot, which has its own.
 */
const ALLOWED_CRAWLERS = [
	'Googlebot', // also Googlebot-Image, Googlebot-News and Googlebot-Video
	'GoogleOther',
	'Google-InspectionTool',
	'Yandex', // YandexImages and the other Yandex bots; YandexBot and YandexMarket are denied
	'DuckDuck',
	'Qwant',
	'facebookexternalhit',
	// HTTP libraries, so that scripts get the NOINDEX page like crawlers do
	'aiohttp',
	'python-request'
];

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Matches a User-Agent with one of `names` at the start of a word, ignoring case, as Product Opener does. */
const userAgentPattern = (names: readonly string[]) =>
	new RegExp(`\\b(?:${names.map(escapeRegExp).join('|')})`, 'i');

const DENIED_CRAWLER_PATTERN = userAgentPattern(
	DENIED_CRAWLERS.map(({ token, userAgent }) => userAgent ?? token)
);
const ALLOWED_CRAWLER_PATTERN = userAgentPattern(ALLOWED_CRAWLERS);

export type CrawlerKind = 'none' | 'allowed' | 'denied';

export function getCrawlerKind(userAgent: string | null): CrawlerKind {
	if (!userAgent) return 'none';
	// Denied first, so that YandexBot is denied although Yandex bots are allowed.
	if (DENIED_CRAWLER_PATTERN.test(userAgent)) return 'denied';
	return ALLOWED_CRAWLER_PATTERN.test(userAgent) ? 'allowed' : 'none';
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

const robotsGroup = (userAgents: string[], rules: string[]) =>
	[...userAgents.map((agent) => `User-agent: ${agent}`), ...rules].join('\n');

const disallow = (paths: string[]) => paths.map((path) => `Disallow: ${path}`);
const allow = (paths: string[]) => paths.map((path) => `Allow: ${path}`);

// Product Opener image and OpenSearch endpoints stay crawlable for Google.
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
			DENIED_CRAWLERS.map(({ token }) => token),
			['Disallow: /']
		)
	].join('\n\n') + '\n';

/**
 * Denied crawlers get `Disallow: /` for every path, like Product Opener's `deny_all_robots_txt`.
 * This also covers a denied User-Agent whose robots.txt token is not listed, such as AhrefsSiteAudit.
 */
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
