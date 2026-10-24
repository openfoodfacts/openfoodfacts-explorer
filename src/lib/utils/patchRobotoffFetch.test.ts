// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { patchRobotoffFetch } from './patchRobotoffFetch.js';

describe('patchRobotoffFetch', () => {
	let originalFetch: typeof window.fetch;
	let mockFetch: ReturnType<typeof vi.fn<typeof window.fetch>>;

	beforeEach(() => {
		originalFetch = window.fetch;
		mockFetch = vi.fn<typeof window.fetch>().mockResolvedValue(new Response());
		window.fetch = mockFetch as unknown as typeof window.fetch;
		delete (window as unknown as { __robotoff_fetch_patched?: boolean }).__robotoff_fetch_patched;
	});

	afterEach(() => {
		window.fetch = originalFetch;
		delete (window as unknown as { __robotoff_fetch_patched?: boolean }).__robotoff_fetch_patched;
	});

	it('strips lc query parameter from string URL inputs for nutrient_extraction insights', async () => {
		patchRobotoffFetch();

		const requestUrl =
			'https://robotoff.openfoodfacts.org/api/v1/insights?insight_types=nutrient_extraction&barcode=123456&lc=en';
		await window.fetch(requestUrl);

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const calledWithUrl = mockFetch.mock.calls[0][0];
		expect(calledWithUrl).toBe(
			'https://robotoff.openfoodfacts.org/api/v1/insights?insight_types=nutrient_extraction&barcode=123456'
		);
	});

	it('strips lc query parameter from URL instance inputs', async () => {
		patchRobotoffFetch();

		const requestUrl = new URL(
			'https://robotoff.openfoodfacts.org/api/v1/insights?insight_types=nutrient_extraction&barcode=123456&lc=fr'
		);
		await window.fetch(requestUrl);

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const calledWithUrl = mockFetch.mock.calls[0][0];
		expect(calledWithUrl).toBe(
			'https://robotoff.openfoodfacts.org/api/v1/insights?insight_types=nutrient_extraction&barcode=123456'
		);
	});

	it('strips lc query parameter from Request instance inputs', async () => {
		patchRobotoffFetch();

		const request = new Request(
			'https://robotoff.openfoodfacts.org/api/v1/insights?insight_types=nutrient_extraction&barcode=123456&lc=de',
			{ headers: { 'X-Custom-Header': 'test' } }
		);
		await window.fetch(request);

		expect(mockFetch).toHaveBeenCalledTimes(1);
		const calledRequest = mockFetch.mock.calls[0][0] as Request;
		expect(calledRequest).toBeInstanceOf(Request);
		expect(calledRequest.url).toBe(
			'https://robotoff.openfoodfacts.org/api/v1/insights?insight_types=nutrient_extraction&barcode=123456'
		);
		expect(calledRequest.headers.get('X-Custom-Header')).toBe('test');
	});

	it('preserves requests without lc query parameter', async () => {
		patchRobotoffFetch();

		const requestUrl =
			'https://robotoff.openfoodfacts.org/api/v1/insights?insight_types=nutrient_extraction&barcode=123456';
		await window.fetch(requestUrl);

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch.mock.calls[0][0]).toBe(requestUrl);
	});

	it('does not modify non-nutrient-extraction requests', async () => {
		patchRobotoffFetch();

		const requestUrl =
			'https://robotoff.openfoodfacts.org/api/v1/insights?insight_types=label&barcode=123456&lc=en';
		await window.fetch(requestUrl);

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch.mock.calls[0][0]).toBe(requestUrl);
	});

	it('does not re-patch window.fetch if called multiple times', async () => {
		patchRobotoffFetch();
		const patchedFetch = window.fetch;
		patchRobotoffFetch();

		expect(window.fetch).toBe(patchedFetch);
	});
});
