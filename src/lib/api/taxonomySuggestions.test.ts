import { describe, expect, it, vi } from 'vitest';
import { getEmbCodeSuggestions } from './product';

function jsonResponse(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

describe('getEmbCodeSuggestions', () => {
	it('requests emb_codes suggestions for the typed string', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValue(
				jsonResponse({ status: 'success', suggestions: ['FR 38.012.001 EC', 'FR 38.012.002 EC'] })
			);

		const suggestions = await getEmbCodeSuggestions(fetchMock, 'FR 38.012');

		const request = fetchMock.mock.calls[0]?.[0];
		const url = new URL(request instanceof Request ? request.url : String(request));
		expect(url.pathname).toBe('/api/v3/taxonomy_suggestions');
		expect(url.searchParams.get('tagtype')).toBe('emb_codes');
		expect(url.searchParams.get('string')).toBe('FR 38.012');
		expect(suggestions).toEqual(['FR 38.012.001 EC', 'FR 38.012.002 EC']);
	});

	it('returns an empty list when the request fails', async () => {
		const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 'failure' }, 500));

		expect(await getEmbCodeSuggestions(fetchMock, 'FR 38')).toEqual([]);
	});
});
