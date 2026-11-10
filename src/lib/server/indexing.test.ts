import { describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import {
	createIndexingHandle,
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

const url = (path: string) => new URL(path, 'https://world.openfoodfacts.org');

describe('getCrawlerKind', () => {
	it('does not flag browsers or missing user agents', () => {
		expect(getCrawlerKind(FIREFOX)).toBe('none');
		expect(getCrawlerKind(null)).toBe('none');
		expect(getCrawlerKind('')).toBe('none');
	});

	it('allows search engine crawlers', () => {
		expect(getCrawlerKind(GOOGLEBOT)).toBe('allowed');
		expect(getCrawlerKind('Mozilla/5.0 (compatible; YandexBot/3.0)')).toBe('allowed');
	});

	it('denies the crawlers Product Opener denies', () => {
		expect(getCrawlerKind(AHREFSBOT)).toBe('denied');
		expect(getCrawlerKind(BINGBOT)).toBe('denied');
		expect(getCrawlerKind('Mozilla/5.0 (compatible; GPTBot/1.2)')).toBe('denied');
		expect(getCrawlerKind('Mozilla/5.0 (compatible; YandexMarket/1.0)')).toBe('denied');
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
	});

	it('serves the standard rules otherwise', () => {
		expect(getRobotsTxt(GOOGLEBOT, true)).toBe(ROBOTS_TXT);
		expect(getRobotsTxt(FIREFOX, true)).toBe(ROBOTS_TXT);
	});
});

describe('ROBOTS_TXT', () => {
	const groups = ROBOTS_TXT.trim()
		.split('\n\n')
		.map((group) => group.split('\n'));
	const group = (agent: string) => groups.find((lines) => lines[0] === `User-agent: ${agent}`);

	it('lets only Googlebot crawl facet pages', () => {
		expect(group('Googlebot')).not.toContain('Disallow: /facets');
		expect(group('*')).toContain('Disallow: /facets');
		expect(group('Bingbot')).toContain('Disallow: /facets');
	});

	it('blocks private pages and Product Opener endpoints for every crawler', () => {
		for (const agent of ['*', 'Googlebot', 'Bingbot']) {
			for (const path of ['/api', '/cgi', '/search', '/settings', '/products/*/edit']) {
				expect(group(agent), `${agent} ${path}`).toContain(`Disallow: ${path}`);
			}
		}
	});

	it('blocks denied crawlers from the whole site', () => {
		const denied = groups.at(-1) ?? [];
		expect(denied).toContain('User-agent: AhrefsBot');
		expect(denied).toContain('User-agent: GPTBot');
		expect(denied.at(-1)).toBe('Disallow: /');
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
		const event = makeEvent('/search', '/search?q=chocolate', FIREFOX);
		const { response, resolve } = await run(true, event);
		expect(resolve).toHaveBeenCalledOnce();
		expect(response.headers.get('x-robots-tag')).toBe('noindex');
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
