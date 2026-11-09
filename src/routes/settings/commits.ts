export type BuildCommit = { sha: string; message: string };

type GitHubCommit = { sha: string; commit: { message: string } };

function isGitHubCommit(value: unknown): value is GitHubCommit {
	if (!value || typeof value !== 'object') return false;
	const candidate = value as { sha?: unknown; commit?: { message?: unknown } | null };
	return (
		typeof candidate.sha === 'string' &&
		/^[a-f\d]{40}$/i.test(candidate.sha) &&
		typeof candidate.commit?.message === 'string'
	);
}

/** Fetch commits starting at the build's immutable commit, never at a moving branch. */
export async function getBuildCommits(
	sha: string,
	fetcher: typeof fetch = fetch
): Promise<BuildCommit[]> {
	if (!/^[a-f\d]{7,40}$/i.test(sha)) throw new Error('Build commit is unavailable');

	const url = new URL('https://api.github.com/repos/openfoodfacts/openfoodfacts-explorer/commits');
	url.searchParams.set('sha', sha);
	url.searchParams.set('per_page', '5');

	const response = await fetcher(url);
	if (!response.ok) throw new Error('Could not load build commits');

	const data: unknown = await response.json();
	if (!Array.isArray(data)) throw new Error('Invalid build commits response');
	if (!data.every(isGitHubCommit)) throw new Error('Invalid build commit');

	return data
		.slice(0, 5)
		.map(({ sha, commit }) => ({ sha, message: commit.message.split('\n')[0] }));
}
