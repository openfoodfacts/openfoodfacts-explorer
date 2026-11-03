import { describe, it, expect, vi } from 'vitest';
import { fetchCurrentUserPermissions, type CurrentUserPermissions } from './permissions';

const asFetch = (mock: unknown) => mock as typeof fetch;

describe('permissions API service', () => {
	it('returns user permissions data on successful response', async () => {
		const mockPermissions: CurrentUserPermissions = {
			status: 'success',
			user: {
				userid: 'test_moderator',
				name: 'Test Moderator',
				moderator: 1,
				admin: 0
			}
		};

		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify(mockPermissions), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			})
		);

		const result = await fetchCurrentUserPermissions(asFetch(mockFetch));

		expect(result).toEqual({ data: mockPermissions });
	});

	it('returns formatted error when API responds with an error property', async () => {
		const mockFetch = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ error: 'Unauthorized user session' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			})
		);

		const result = await fetchCurrentUserPermissions(asFetch(mockFetch));

		expect(result.error).toBeDefined();
		expect(result.error).toContain('Failed to fetch user permissions:');
		expect(result.data).toBeUndefined();
	});

	it('catches network errors gracefully without crashing or throwing', async () => {
		const mockFetch = vi.fn().mockRejectedValue(new Error('Network connection timeout'));

		const result = await fetchCurrentUserPermissions(asFetch(mockFetch));

		expect(result).toEqual({ error: 'Network connection timeout' });
	});

	it('handles non-Error exceptions gracefully', async () => {
		const mockFetch = vi.fn().mockRejectedValue('Internal Gateway Crash');

		const result = await fetchCurrentUserPermissions(asFetch(mockFetch));

		expect(result).toEqual({ error: 'Internal Gateway Crash' });
	});
});
