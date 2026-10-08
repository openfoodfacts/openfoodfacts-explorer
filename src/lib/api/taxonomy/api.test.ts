import { describe, expect, it, vi } from 'vitest';
import { getTaxo } from './api';

describe('getTaxo', () => {
	it('rejects non-successful responses before parsing taxonomy data', async () => {
		const json = vi.fn();
		const response = {
			ok: false,
			status: 503,
			statusText: 'Service Unavailable',
			json
		} as unknown as Response;
		const fetch = vi.fn(async () => response);

		await expect(getTaxo('languages', fetch)).rejects.toThrow(
			'Failed to fetch taxonomy languages: 503 Service Unavailable'
		);
		expect(json).not.toHaveBeenCalled();
	});
});
