import { describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import {
	createIndexingHandle,
	DENIED_CRAWLERS,
	DENY_ALL_ROBOTS_TXT,
	getCrawlerKind,
	getRobotsTxt,
	isIndexable,
	isIndexingAllowed,
	NOINDEX_HTML,
	ROBOTS_TXT
} from './indexing';

// User agents from Product Opener's tests/integration/page_crawler.t
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const AHREFSBOT = 'Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)';
const FIREFOX = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/114.0';
const BINGBOT = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';

// User agents as these crawlers send them
const GOOGLEBOT_SMARTPHONE =
	'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7390.122 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const YANDEXBOT = 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)';

// The DuckDuckGo browser adds DuckDuckGo/<major version> to its User-Agent (UserAgentProvider in duckduckgo/Android)
const DUCKDUCKGO_ANDROID =
	'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile DuckDuckGo/5 Safari/537.36';

const url = (path: string) => new URL(path, 'https://world.openfoodfacts.org');

type RobotsGroup = { agents: string[]; rules: string[] };

/** Splits robots.txt into groups: user-agent lines and the rules that follow them (RFC 9309). */
function parseRobotsTxt(text: string): RobotsGroup[] {
	const groups: RobotsGroup[] = [];
	for (const line of text.split('\n')) {
		const match = /^([\w-]+):\s*(.*)$/.exec(line.trim());
		if (!match) continue;
		const [, field, value] = match;
		const current = groups.at(-1);
		if (field.toLowerCase() !== 'user-agent') current?.rules.push(`${field}: ${value}`);
		else if (current && current.rules.length === 0) current.agents.push(value);
		else groups.push({ agents: [value], rules: [] });
	}
	return groups;
}

const robotsGroups = parseRobotsTxt(ROBOTS_TXT);
const rulesFor = (agent: string) =>
	robotsGroups.find((group) => group.agents.includes(agent))?.rules;
// Crawlers that robots.txt keeps out of the whole site
const bannedAgents = robotsGroups
	.filter((group) => group.rules.join('\n') === 'Disallow: /')
	.flatMap((group) => group.agents);

describe('getCrawlerKind', () => {
	it('does not flag browsers or missing user agents', () => {
		for (const userAgent of [
			FIREFOX,
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
			'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
			DUCKDUCKGO_ANDROID
		]) {
			expect(getCrawlerKind(userAgent), userAgent).toBe('none');
		}
		expect(getCrawlerKind(null)).toBe('none');
		expect(getCrawlerKind('')).toBe('none');
	});

	it('allows search engine crawlers', () => {
		for (const userAgent of [
			GOOGLEBOT,
			GOOGLEBOT_SMARTPHONE,
			'Googlebot-Image/1.0',
			'Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)',
			'Mozilla/5.0 (compatible; YandexImages/3.0; +http://yandex.com/bots)',
			'DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)'
		]) {
			expect(getCrawlerKind(userAgent), userAgent).toBe('allowed');
		}
	});

	it('denies the crawlers Product Opener denies', () => {
		expect(getCrawlerKind(AHREFSBOT)).toBe('denied');
		expect(getCrawlerKind(BINGBOT)).toBe('denied');
		expect(getCrawlerKind('Mozilla/5.0 (compatible; GPTBot/1.2)')).toBe('denied');
		expect(getCrawlerKind('Mozilla/5.0 (compatible; YandexMarket/1.0)')).toBe('denied');
	});

	it('denies the crawlers robots.txt bans, which Product Opener lets through', () => {
		for (const userAgent of [
			YANDEXBOT,
			'Mozilla/5.0 (compatible; DotBot/1.2; +https://opensiteexplorer.org/dotbot; help@moz.com)',
			'Mozilla/5.0 (compatible; spbot/5.0.3; +http://OpenLinkProfiler.org/bot )',
			'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
			'Mozilla/5.0 (compatible; AliyunSecBot/Aliyun; AliyunSecBot@service.alibaba.com)',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.81 YisouSpider/5.0 Safari/537.36'
		]) {
			expect(getCrawlerKind(userAgent), userAgent).toBe('denied');
		}
	});
});

describe('robots.txt and the User-Agent check', () => {
	it('serves the NOINDEX page to every crawler that robots.txt bans', () => {
		expect(bannedAgents).not.toHaveLength(0);
		for (const agent of bannedAgents) {
			expect(getCrawlerKind(`Mozilla/5.0 (compatible; ${agent}/1.0)`), agent).toBe('denied');
		}
	});

	it('bans in robots.txt every crawler that the User-Agent check denies', () => {
		for (const { token } of DENIED_CRAWLERS) {
			expect(bannedAgents, token).toContain(token);
		}
	});
});

describe('isIndexingAllowed', () => {
	it('only allows production', () => {
		expect(isIndexingAllowed('production')).toBe(true);
		expect(isIndexingAllowed('staging')).toBe(false);
		expect(isIndexingAllowed('development')).toBe(false);
		expect(isIndexingAllowed('')).toBe(false);
		expect(isIndexingAllowed(undefined)).toBe(false);
	});
});

describe('isIndexable', () => {
	const facetValue = (facet: string, value: string, query = '') =>
		isIndexable(
			'/facets/[facet]/[value]',
			{ facet, value },
			url(`/facets/${facet}/${value}${query}`)
		);

	it('indexes the first page of values of indexed facets', () => {
		expect(facetValue('categories', 'hazelnut-spreads')).toBe(true);
		expect(facetValue('brands', 'nutella')).toBe(true);
		expect(facetValue('nutrition-grades', 'a')).toBe(true);
		expect(facetValue('environmental-score', 'b')).toBe(true);
		expect(facetValue('categories', 'hazelnut-spreads', '?page=1')).toBe(true);
	});

	it('does not index values of other facets', () => {
		expect(facetValue('editors', 'unknown-user')).toBe(false);
		expect(facetValue('ingredients', 'sugar')).toBe(false);
		expect(facetValue('countries', 'france')).toBe(false);
	});

	it('does not index facet pages after the first one', () => {
		expect(facetValue('categories', 'hazelnut-spreads', '?page=2')).toBe(false);
		expect(facetValue('categories', 'hazelnut-spreads', '?page=10')).toBe(false);
	});

	it('does not index lists of tags or nested facets', () => {
		expect(isIndexable('/facets', {}, url('/facets'))).toBe(false);
		expect(isIndexable('/facets/[facet]', { facet: 'categories' }, url('/facets/categories'))).toBe(
			false
		);
		expect(
			isIndexable(
				'/facets/[facet]/[value]/[facet2]/[value2]',
				{ facet: 'categories', value: 'hazelnut-spreads', facet2: 'brands', value2: 'nutella' },
				url('/facets/categories/hazelnut-spreads/brands/nutella')
			)
		).toBe(false);
	});

	it('does not index personal, utility or search pages', () => {
		for (const routeId of [
			'/search',
			'/settings',
			'/compare',
			'/compare/shared',
			'/scan',
			'/loginrequired',
			'/oauth/login/callback',
			'/products/[barcode]/edit',
			'/users/[user]',
			'/folksonomy/[key]'
		]) {
			expect(isIndexable(routeId, {}, url('/')), routeId).toBe(false);
		}
	});

	it('indexes content pages', () => {
		for (const routeId of ['/', '/products/[barcode]', '/static/[id]', '/explore']) {
			expect(isIndexable(routeId, {}, url('/')), routeId).toBe(true);
		}
	});

	it('leaves unmatched routes to their own status', () => {
		expect(isIndexable(null, {}, url('/does-not-exist'))).toBe(true);
	});
});

describe('getRobotsTxt', () => {
	it('denies everything outside production', () => {
		expect(getRobotsTxt(GOOGLEBOT, false)).toBe(DENY_ALL_ROBOTS_TXT);
	});

	it('denies everything to denied crawlers', () => {
		expect(getRobotsTxt(AHREFSBOT, true)).toBe(DENY_ALL_ROBOTS_TXT);
		expect(getRobotsTxt(YANDEXBOT, true)).toBe(DENY_ALL_ROBOTS_TXT);
	});

	it('serves the standard rules otherwise', () => {
		expect(getRobotsTxt(GOOGLEBOT, true)).toBe(ROBOTS_TXT);
		expect(getRobotsTxt(FIREFOX, true)).toBe(ROBOTS_TXT);
	});
});

describe('ROBOTS_TXT', () => {
	it('lets only Googlebot crawl facet pages', () => {
		expect(rulesFor('Googlebot')).not.toContain('Disallow: /facets');
		expect(rulesFor('*')).toContain('Disallow: /facets');
	});

	it('blocks private pages and Product Opener endpoints for every crawler', () => {
		for (const agent of ['*', 'Googlebot']) {
			for (const path of ['/api', '/cgi', '/search', '/settings', '/products/*/edit']) {
				expect(rulesFor(agent), `${agent} ${path}`).toContain(`Disallow: ${path}`);
			}
		}
	});

	it('blocks denied crawlers from the whole site', () => {
		for (const agent of ['AhrefsBot', 'GPTBot', 'Bingbot', 'YandexBot', 'SeznamBot']) {
			expect(rulesFor(agent), agent).toEqual(['Disallow: /']);
		}
	});

	it('names each crawler in one group only, as crawlers merge the rules of every group naming them', () => {
		const agents = robotsGroups.flatMap((group) =>
			group.agents.map((agent) => agent.toLowerCase())
		);
		expect(new Set(agents).size).toBe(agents.length);
	});
});

describe('createIndexingHandle', () => {
	const makeEvent = (
		routeId: string | null,
		path: string,
		userAgent: string,
		params: Record<string, string> = {}
	) =>
		({
			route: { id: routeId },
			params,
			url: url(path),
			request: new Request(url(path), { headers: { 'user-agent': userAgent } }),
			isDataRequest: false,
			isSubRequest: false
		}) as unknown as RequestEvent;

	const run = async (indexingAllowed: boolean, event: RequestEvent) => {
		const resolve = vi.fn(async () => new Response('page'));
		const response = await createIndexingHandle(indexingAllowed)({ event, resolve });
		return { response, resolve };
	};

	const categoryPage = (userAgent: string) =>
		makeEvent('/facets/[facet]/[value]', '/facets/categories/cakes', userAgent, {
			facet: 'categories',
			value: 'cakes'
		});

	it('renders indexable pages for crawlers without a noindex header', async () => {
		const { response, resolve } = await run(true, categoryPage(GOOGLEBOT));
		expect(resolve).toHaveBeenCalledOnce();
		expect(response.headers.get('x-robots-tag')).toBeNull();
	});

	it('serves crawlers a noindex page without rendering non-indexable pages', async () => {
		const event = makeEvent('/facets/[facet]', '/facets/categories', GOOGLEBOT, {
			facet: 'categories'
		});
		const { response, resolve } = await run(true, event);
		expect(resolve).not.toHaveBeenCalled();
		expect(await response.text()).toBe(NOINDEX_HTML);
		expect(response.headers.get('x-robots-tag')).toBe('noindex');
		expect(response.headers.get('cache-control')).toBe('no-store');
	});

	it('serves denied crawlers a noindex page everywhere', async () => {
		const event = makeEvent('/products/[barcode]', '/products/3017620422003', AHREFSBOT, {
			barcode: '3017620422003'
		});
		const { response, resolve } = await run(true, event);
		expect(resolve).not.toHaveBeenCalled();
		expect(await response.text()).toBe(NOINDEX_HTML);
	});

	it('renders non-indexable pages for people with a noindex header', async () => {
		for (const userAgent of [FIREFOX, DUCKDUCKGO_ANDROID]) {
			const event = makeEvent('/search', '/search?q=chocolate', userAgent);
			const { response, resolve } = await run(true, event);
			expect(resolve, userAgent).toHaveBeenCalledOnce();
			expect(response.headers.get('x-robots-tag')).toBe('noindex');
		}
	});

	it('adds a noindex header to every page outside production', async () => {
		const { response } = await run(false, categoryPage(FIREFOX));
		expect(response.headers.get('x-robots-tag')).toBe('noindex');
	});

	it('leaves data requests and robots.txt alone', async () => {
		const dataEvent = { ...categoryPage(AHREFSBOT), isDataRequest: true } as RequestEvent;
		expect((await run(true, dataEvent)).resolve).toHaveBeenCalledOnce();

		const robotsEvent = makeEvent('/robots.txt', '/robots.txt', AHREFSBOT);
		expect((await run(true, robotsEvent)).resolve).toHaveBeenCalledOnce();
	});
});
