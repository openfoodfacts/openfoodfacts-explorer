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

// Independent literal API contract definitions to ensure tests are not coupled
// to production constants and independently verify the expected API contract
const EXPECTED_API_DEFAULT_FACETS = [
	'brands',
	'categories',
	'nutrition_grades',
	'environmental_score_grade',
	'nova_group',
	'labels',
	'countries',
	'allergens',
	'additives',
	'stores',
	'languages'
];

const EXPECTED_API_FALLBACK_FACETS = [
	'brands',
	'categories',
	'nutrition_grades',
	'environmental_score_grade'
];

const EXPECTED_API_DEFAULT_CHARTS = [
	{ chart_type: 'DistributionChart', field: 'nutrition_grades' },
	{ chart_type: 'DistributionChart', field: 'environmental_score_grade' },
	{ chart_type: 'DistributionChart', field: 'nova_group' },
	{ chart_type: 'ScatterChart', x: 'nutriscore_score', y: 'nutriments.fiber_100g' }
];

const EXPECTED_API_FALLBACK_CHARTS = [
	{ chart_type: 'DistributionChartType', field: 'nutrition_grades' },
	{ chart_type: 'DistributionChartType', field: 'environmental_score_grade' },
	{ chart_type: 'DistributionChartType', field: 'nova_group' },
	{ chart_type: 'ScatterChartType', x: 'nutriscore_score', y: 'nutriments.fiber_100g' }
];

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

describe('search schema constants', () => {
	it('DEFAULT_SEARCH_CHARTS conforms to the primary API contract without legacy chart types', async () => {
		const { DEFAULT_SEARCH_CHARTS } = await import('./search');

		expect(DEFAULT_SEARCH_CHARTS).toEqual(EXPECTED_API_DEFAULT_CHARTS);
		for (const chart of DEFAULT_SEARCH_CHARTS) {
			expect(['DistributionChart', 'ScatterChart']).toContain(chart.chart_type);
			expect(chart.chart_type).not.toBe('DistributionChartType');
			expect(chart.chart_type).not.toBe('ScatterChartType');
		}
	});

	it('FALLBACK_SEARCH_CHARTS uses legacy chart types for backward compatibility', async () => {
		const { FALLBACK_SEARCH_CHARTS } = await import('./search');

		expect(FALLBACK_SEARCH_CHARTS).toEqual(EXPECTED_API_FALLBACK_CHARTS);
		for (const chart of FALLBACK_SEARCH_CHARTS) {
			expect(['DistributionChartType', 'ScatterChartType']).toContain(chart.chart_type);
		}
	});

	it('DEFAULT_SEARCH_FACETS and FALLBACK_SEARCH_FACETS match the expected API contract', async () => {
		const { DEFAULT_SEARCH_FACETS, FALLBACK_SEARCH_FACETS } = await import('./search');

		expect(DEFAULT_SEARCH_FACETS).toEqual(EXPECTED_API_DEFAULT_FACETS);
		expect(FALLBACK_SEARCH_FACETS).toEqual(EXPECTED_API_FALLBACK_FACETS);
	});
});

describe('search parameters and fallback', () => {
	beforeEach(() => {
		vi.resetModules();
		mockEnv.PUBLIC_SEARCH_BASE_URL = 'https://search.openfoodfacts.net';
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

			// Reject incompatible primary chart format on legacy server
			const hasModernChartFormat = bodyData?.charts?.some(
				(chart) => chart.chart_type === 'DistributionChart' || chart.chart_type === 'ScatterChart'
			);

			if (callCount === 1 || hasModernChartFormat) {
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

			// Fallback legacy request succeeds
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

		// Verify request uses production constants
		expect(fallbackBody.facets).toEqual(FALLBACK_SEARCH_FACETS);
		expect(fallbackBody.charts).toEqual(FALLBACK_SEARCH_CHARTS);

		// Independently assert the literal legacy API contract
		expect(fallbackBody.facets).toEqual(EXPECTED_API_FALLBACK_FACETS);
		expect(fallbackBody.charts).toEqual(EXPECTED_API_FALLBACK_CHARTS);
		for (const chart of fallbackBody.charts ?? []) {
			expect(['DistributionChartType', 'ScatterChartType']).toContain(chart.chart_type);
		}

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

		// Verify request uses production constants
		expect(primaryBody.facets).toEqual(DEFAULT_SEARCH_FACETS);
		expect(primaryBody.charts).toEqual(DEFAULT_SEARCH_CHARTS);

		// Independently assert the literal API contract to prevent #1720 regression in primary requests
		expect(primaryBody.facets).toEqual(EXPECTED_API_DEFAULT_FACETS);
		expect(primaryBody.charts).toEqual(EXPECTED_API_DEFAULT_CHARTS);
		for (const chart of primaryBody.charts ?? []) {
			expect(['DistributionChart', 'ScatterChart']).toContain(chart.chart_type);
			expect(chart.chart_type).not.toBe('DistributionChartType');
			expect(chart.chart_type).not.toBe('ScatterChartType');
		}

		expect(result.data).toBeDefined();
	});
});
