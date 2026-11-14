import { describe, expect, it, vi } from 'vitest';
import { getGitHubCommits } from './github-commits.js';

const sha = 'a'.repeat(40);
const repoUrl = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

describe('getGitHubCommits', () => {
	it('requests the history at the build SHA and keeps commit subjects', async () => {
		const fetcher = vi
			.fn<typeof fetch>()
			.mockResolvedValue(
				new Response(JSON.stringify([{ sha, commit: { message: 'Fix a thing\n\nDetails' } }]))
			);
		expect(await getGitHubCommits(sha, repoUrl, fetcher)).toEqual([
			{ sha, message: 'Fix a thing' }
		]);
		const url = new URL(String(fetcher.mock.calls[0][0]));
		expect(url.searchParams.get('sha')).toBe(sha);
		expect(url.searchParams.get('per_page')).toBe('5');
	});

	it('does not request a moving branch when the build SHA is unknown', async () => {
		const fetcher = vi.fn<typeof fetch>();
		await expect(getGitHubCommits('unknown', repoUrl, fetcher)).rejects.toThrow();
		expect(fetcher).not.toHaveBeenCalled();
	});

	it('rejects failed or malformed responses', async () => {
		await expect(
			getGitHubCommits(
				sha,
				repoUrl,
				vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 403 }))
			)
		).rejects.toThrow();
		await expect(
			getGitHubCommits(
				sha,
				repoUrl,
				vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify([{ sha: 'bad' }])))
			)
		).rejects.toThrow();
	});
});
