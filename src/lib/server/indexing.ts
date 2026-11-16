import type { Handle } from '@sveltejs/kit/hooks';
import type { RouteId } from '$app/types';
import { PUBLIC_ENVIRONMENT } from '$app/env/public';

type DeniedCrawler = {
	token: string;
	userAgentPrefix?: string;
};

export const DENIED_CRAWLERS: readonly DeniedCrawler[] = [
	{ token: 'AhrefsBot', userAgentPrefix: 'Ahrefs' },
	{ token: 'AliyunSecBot' },
	{ token: 'Amazonbot', userAgentPrefix: 'Amazon' },
	{ token: 'anthropic-ai' },
	{ token: 'Applebot' },
	{ token: 'Bingbot' },
	{ token: 'Bytespider' },
	{ token: 'ChatGPT-User' },
	{ token: 'Claude-Web' },
	{ token: 'ClaudeBot' },
	{ token: 'Cliqzbot', userAgentPrefix: 'Cliqz' },
	{ token: 'cohere-ai' },
	{ token: 'DataForSeoBot', userAgentPrefix: 'DataForSeo' },
	{ token: 'Diffbot' },
	{ token: 'DotBot' },
	{ token: 'GPTBot' },
	{ token: 'ImagesiftBot' },
	{ token: 'MegaIndex.ru' },
	{ token: 'meta-externalagent' },
	{ token: 'meta-webindexer' },
	{ token: 'MJ12bot', userAgentPrefix: 'MJ12' },
	{ token: 'MojeekBot', userAgentPrefix: 'Mojeek' },
	{ token: 'OAI-SearchBot' },
	{ token: 'Paracrawl' },
	{ token: 'PerplexityBot' },
	{ token: 'QRbot' },
	{ token: 'Scrapy' },
	{ token: 'SearchmetricsBot', userAgentPrefix: 'Searchmetrics' },
	{ token: 'Seekport' },
	{ token: 'SeekportBot', userAgentPrefix: 'Seekport' },
	{ token: 'SemrushBot', userAgentPrefix: 'Semrush' },
	{ token: 'SEOdiver' },
	{ token: 'SEOkicks-Robot', userAgentPrefix: 'SEOkicks' },
	{ token: 'SeznamBot', userAgentPrefix: 'Seznam' },
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

const ALLOWED_CRAWLER_PREFIXES = [
	'Googlebot',
	'GoogleOther',
	'Google-InspectionTool',
	'Yandex',
	'DuckDuckBot',
	'Qwant',
	'facebookexternalhit',
	'aiohttp',
	'python-request'
];

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const userAgentPattern = (prefixes: readonly string[]) =>
	new RegExp(`\\b(?:${prefixes.map(escapeRegExp).join('|')})`, 'i');

const DENIED_CRAWLER_PATTERN = userAgentPattern(
	DENIED_CRAWLERS.map(({ token, userAgentPrefix }) => userAgentPrefix ?? token)
);
const ALLOWED_CRAWLER_PATTERN = userAgentPattern(ALLOWED_CRAWLER_PREFIXES);

export type CrawlerKind = 'none' | 'allowed' | 'denied';

export function getCrawlerKind(userAgent: string | null): CrawlerKind {
	if (!userAgent) return 'none';
	if (DENIED_CRAWLER_PATTERN.test(userAgent)) return 'denied';
	return ALLOWED_CRAWLER_PATTERN.test(userAgent) ? 'allowed' : 'none';
}

export function isIndexingAllowed(environment: string | undefined): boolean {
	return environment === 'production';
}

export const INDEXED_FACETS: ReadonlySet<string> = new Set([
	'brands',
	'categories',
	'labels',
	'additives',
	'nova-groups',
	'environmental-score',
	'nutrition-grades'
]);

type PathPrefixes<
	Path extends string,
	Parent extends string = ''
> = Path extends `/${infer Segment}/${infer Rest}`
	? `${Parent}/${Segment}` | PathPrefixes<`/${Rest}`, `${Parent}/${Segment}`>
	: Path extends `/${infer Segment}`
		? `${Parent}/${Segment}`
		: never;

type RouteGroup = PathPrefixes<RouteId>;

const NOINDEX_ROUTES: readonly RouteGroup[] = [
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

const FACET_ROUTES: RouteGroup = '/facets';
const FACET_VALUE_ROUTE: RouteId = '/facets/[facet]/[value]';

const isInGroup = (routeId: string, group: RouteGroup) =>
	routeId === group || routeId.startsWith(`${group}/`);

export function isIndexable(
	routeId: string | null,
	params: Partial<Record<string, string>>,
	url: URL
): boolean {
	if (routeId === null) return true;
	if (NOINDEX_ROUTES.some((group) => isInGroup(routeId, group))) return false;

	if (isInGroup(routeId, FACET_ROUTES)) {
		const page = Number(url.searchParams.get('page') ?? '1');
		return routeId === FACET_VALUE_ROUTE && INDEXED_FACETS.has(params.facet ?? '') && !(page >= 2);
	}

	return true;
}

export const NOINDEX_HTML =
	'<!DOCTYPE html><html lang="en"><head><meta name="robots" content="noindex"></head><body><h1>NOINDEX</h1><p>We detected that your browser is a web crawling bot, and this page should not be indexed by web crawlers. If this is unexpected, contact us on Slack or write us an email at <a href="mailto:contact@openfoodfacts.org">contact@openfoodfacts.org</a>.</p></body></html>';

export const DENY_ALL_ROBOTS_TXT = 'User-agent: *\nDisallow: /\n';

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

const ALLOWED_CGI = ['/cgi/product_image.pl', '/cgi/opensearch.pl'];

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

export function getRobotsTxt(
	userAgent: string | null,
	indexingAllowed = isIndexingAllowed(PUBLIC_ENVIRONMENT)
): string {
	if (!indexingAllowed || getCrawlerKind(userAgent) === 'denied') return DENY_ALL_ROBOTS_TXT;
	return ROBOTS_TXT;
}

function noindexResponse(): Response {
	return new Response(NOINDEX_HTML, {
		headers: {
			'content-type': 'text/html; charset=utf-8',
			'x-robots-tag': 'noindex',
			'cache-control': 'no-store',
			vary: 'user-agent'
		}
	});
}

export function createIndexingHandle(
	indexingAllowed = isIndexingAllowed(PUBLIC_ENVIRONMENT)
): Handle {
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
