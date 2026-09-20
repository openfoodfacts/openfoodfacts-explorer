import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SearchBody } from '@openfoodfacts/openfoodfacts-nodejs';

// mutable mock object (values can change inside tests)
const mockEnv = {
	PUBLIC_SEARCH_BASE_URL: ''
};

// mock Svelte public env
vi.mock('$env/dynamic/public', () => ({
	get env() {
		return mockEnv;
	}
}));

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

	it('should use valid chart types in DEFAULT_SEARCH_CHARTS', async () => {
		const { DEFAULT_SEARCH_CHARTS } = await import('./search');

		expect(DEFAULT_SEARCH_CHARTS.length).toBeGreaterThan(0);
		for (const chart of DEFAULT_SEARCH_CHARTS) {
			expect(['DistributionChart', 'ScatterChart']).toContain(chart.chart_type);
			expect(chart.chart_type).not.toBe('DistributionChartType');
			expect(chart.chart_type).not.toBe('ScatterChartType');
		}
	});

	it('should use legacy chart types in FALLBACK_SEARCH_CHARTS for backward compatibility', async () => {
		const { FALLBACK_SEARCH_CHARTS } = await import('./search');

		expect(FALLBACK_SEARCH_CHARTS.length).toBeGreaterThan(0);
		for (const chart of FALLBACK_SEARCH_CHARTS) {
			expect(['DistributionChartType', 'ScatterChartType']).toContain(chart.chart_type);
		}
	});

	it('should fall back to basic facets with legacy chart types when primary search fails', async () => {
		const { compatSearch, FALLBACK_SEARCH_FACETS, FALLBACK_SEARCH_CHARTS } =
			await import('./search');

		const requestBodies: SearchBody[] = [];
		let callCount = 0;

		const mockFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			callCount += 1;
			let bodyData: SearchBody | null = null;
			if (typeof Request !== 'undefined' && input instanceof Request) {
				try {
					bodyData = (await input.clone().json()) as SearchBody;
				} catch {
					// ignore
				}
			} else if (init?.body) {
				bodyData = (
					typeof init.body === 'string' ? JSON.parse(init.body) : init.body
				) as SearchBody;
			}

			if (bodyData) {
				requestBodies.push(bodyData);
			}

			if (callCount === 1) {
				// Simulate primary newParams failure (e.g. 422 on legacy server)
				return new Response(JSON.stringify({ detail: 'Error in complex facets' }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			// Fallback oldParams succeeds
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

		const result = await compatSearch(mockFetch as unknown as typeof fetch, {
			q: 'Meats',
			langs: ['en'],
			page: 1,
			page_size: 24,
			sort_by: '-unique_scans_n'
		});

		expect(callCount).toBe(2);
		expect(requestBodies.length).toBe(2);

		// Verify fallback request (second call) sends legacy fallback facets and charts
		const fallbackBody = requestBodies[1];
		expect(fallbackBody.facets).toEqual(FALLBACK_SEARCH_FACETS);
		expect(fallbackBody.charts).toEqual(FALLBACK_SEARCH_CHARTS);

		expect(result.data).toBeDefined();
	});

	it('should use primary search parameters with all facets when primary search succeeds', async () => {
		const { compatSearch, DEFAULT_SEARCH_FACETS, DEFAULT_SEARCH_CHARTS } = await import('./search');

		const requestBodies: SearchBody[] = [];
		let callCount = 0;

		const mockFetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
			callCount += 1;
			let bodyData: SearchBody | null = null;
			if (typeof Request !== 'undefined' && input instanceof Request) {
				try {
					bodyData = (await input.clone().json()) as SearchBody;
				} catch {
					// ignore
				}
			} else if (init?.body) {
				bodyData = (
					typeof init.body === 'string' ? JSON.parse(init.body) : init.body
				) as SearchBody;
			}

			if (bodyData) {
				requestBodies.push(bodyData);
			}

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

		const result = await compatSearch(mockFetch as unknown as typeof fetch, {
			q: 'Meats',
			langs: ['en'],
			page: 1,
			page_size: 24,
			sort_by: '-unique_scans_n'
		});

		expect(callCount).toBe(1);
		expect(requestBodies.length).toBe(1);

		const primaryBody = requestBodies[0];
		expect(primaryBody.facets).toEqual(DEFAULT_SEARCH_FACETS);
		expect(primaryBody.charts).toEqual(DEFAULT_SEARCH_CHARTS);
		expect(result.data).toBeDefined();
	});
});
