<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from '#lib/i18n/index.js';
	import { getGitHubCommits, type GitHubCommitInfo } from './github-commits.js';

	let { sha, repoUrl }: { sha: string; repoUrl: string } = $props();
	let buildCommits = $state<Promise<GitHubCommitInfo[]> | undefined>();
	onMount(() => {
		buildCommits = getGitHubCommits(sha, repoUrl);
	});
</script>

<div class="mt-4 text-sm">
	<h3 class="font-semibold">
		{$_('settings.recent_commits', { default: 'Recent commits in this version' })}
	</h3>
	{#if buildCommits}
		{#await buildCommits}
			<p>{$_('settings.commits_loading', { default: 'Loading commits…' })}</p>
		{:then commits}
			{#if commits.length}
				<ul class="menu mt-2 w-full rounded-box border border-primary-content/20 p-1">
					{#each commits as commit (commit.sha)}
						<li>
							<a
								class="flex items-start gap-3 wrap-break-word hover:bg-primary-content/10 focus-visible:outline-2 focus-visible:outline-primary-content"
								href="{repoUrl}/commit/{commit.sha}"
								target="_blank"
								rel="noopener noreferrer"
							>
								<span class="shrink-0 font-mono text-primary-content/70">
									{commit.sha.slice(0, 7)}
								</span>
								<span class="min-w-0 wrap-break-word">{commit.message}</span></a
							>
						</li>
					{/each}
				</ul>
			{:else}
				<p>
					{$_('settings.commits_unavailable', {
						default: 'Commit history is unavailable.'
					})}
				</p>
			{/if}
		{:catch}
			<p>
				{$_('settings.commits_unavailable', {
					default: 'Commit history is unavailable.'
				})}
			</p>
		{/await}
	{:else}
		<p>{$_('settings.commits_loading', { default: 'Loading commits…' })}</p>
	{/if}
</div>
