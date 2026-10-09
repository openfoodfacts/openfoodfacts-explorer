import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SearchBody } from '@openfoodfacts/openfoodfacts-nodejs';

// mutable mock object (values can change inside tests)
const mockEnv = {
	PUBLIC_SEARCH_BASE_URL: ''
};

// mock SvelteKit's generated public env
vi.mock('$app/env/public', () => ({
	get PUBLIC_SEARCH_BASE_URL() {
		return mockEnv.PUBLIC_SEARCH_BASE_URL;
	}
}));

async function parseRequestBody(
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<SearchBody | null> {
	if (typeof Request !== 'undefined' && input instanceof Request) {
		try {
			return (await input.clone().json()) as SearchBody;
		} catch {
			return null;
		}
	} else if (init?.body) {
		return (typeof init.body === 'string' ? JSON.parse(init.body) : init.body) as SearchBody;
	}
	return null;
}

describe('getSearchBaseUrl', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('should throw error if PUBLIC_SEARCH_BASE_URL is empty', async () => {
		mockEnv.PUBLIC_SEARCH_BASE_URL = '';

		const { getSearchBaseUrl } = await import('./search');

		expect(() => getSearchBaseUrl()).toThrow(
			'PUBLIC_SEARCH_BASE_URL is not set. Please set it in your environment variables.'
		);
	});

	it('should return base URL if PUBLIC_SEARCH_BASE_URL is set', async () => {
		mockEnv.PUBLIC_SEARCH_BASE_URL = 'https://example.com';

		const { getSearchBaseUrl } = await import('./search');

		expect(getSearchBaseUrl()).toBe('https://example.com');
	});
});

describe('search parameters and fallback', () => {
	beforeEach(() => {
		vi.resetModules();
		mockEnv.PUBLIC_SEARCH_BASE_URL = 'https://search.openfoodfacts.net';
	});

	it('uses primary parameters by default and falls back to legacy parameters on error', async () => {
		const {
			compatSearch,
			DEFAULT_SEARCH_FACETS,
			DEFAULT_SEARCH_CHARTS,
			FALLBACK_SEARCH_FACETS,
			FALLBACK_SEARCH_CHARTS
		} = await import('./search');

		const searchParams = {
			q: 'Meats',
			langs: ['en'],
			page: 1,
			page_size: 24,
			sort_by: '-unique_scans_n'
		};

		// 1. Primary search succeeds
		const successBodies: SearchBody[] = [];
		const mockFetchSuccess = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const bodyData = await parseRequestBody(input, init);
			if (bodyData) successBodies.push(bodyData);

			return new Response(
				JSON.stringify({
					hits: [{ code: '123' }],
					count: 1,
					facets: {},
					charts: {}
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		});

		const successResult = await compatSearch(
			mockFetchSuccess as unknown as typeof fetch,
			searchParams
		);

		expect(mockFetchSuccess).toHaveBeenCalledTimes(1);
		expect(successBodies.length).toBe(1);
		expect(successBodies[0].facets).toEqual(DEFAULT_SEARCH_FACETS);
		expect(successBodies[0].charts).toEqual(DEFAULT_SEARCH_CHARTS);
		expect(successResult.data).toBeDefined();

		// 2. Primary search fails and falls back to legacy parameters
		const fallbackBodies: SearchBody[] = [];
		const mockFetchFallback = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			const bodyData = await parseRequestBody(input, init);
			if (bodyData) fallbackBodies.push(bodyData);

			if (fallbackBodies.length === 1) {
				return new Response(
					JSON.stringify({
						detail: [
							{
								type: 'literal_error',
								msg: "Input should be 'DistributionChartType'",
								input: 'DistributionChart'
							}
						]
					}),
					{
						status: 422,
						headers: { 'Content-Type': 'application/json' }
					}
				);
			}

			return new Response(
				JSON.stringify({
					hits: [],
					count: 0,
					facets: {},
					charts: {}
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		});

		const fallbackResult = await compatSearch(
			mockFetchFallback as unknown as typeof fetch,
			searchParams
		);

		expect(mockFetchFallback).toHaveBeenCalledTimes(2);
		expect(fallbackBodies.length).toBe(2);
		expect(fallbackBodies[0].facets).toEqual(DEFAULT_SEARCH_FACETS);
		expect(fallbackBodies[0].charts).toEqual(DEFAULT_SEARCH_CHARTS);
		expect(fallbackBodies[1].facets).toEqual(FALLBACK_SEARCH_FACETS);
		expect(fallbackBodies[1].charts).toEqual(FALLBACK_SEARCH_CHARTS);
		expect(fallbackResult.data).toBeDefined();
	});
});
