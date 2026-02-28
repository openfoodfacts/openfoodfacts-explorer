<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import IconMdiMagnify from '@iconify-svelte/mdi/magnify';
	import IconMdiInformationOutline from '@iconify-svelte/mdi/information-outline';
	import IconMdiChevronUp from '@iconify-svelte/mdi/chevron-up';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import type { FolksonomyKey } from '@openfoodfacts/openfoodfacts-nodejs';
	import { _ } from '$lib/i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Ensure data.keys exists and has a default empty array if undefined
	let sortedTags = $derived.by(() => {
		return data.keys != null ? [...data.keys].sort((a, b) => a.k.localeCompare(b.k)) : [];
	});

	// Search functionality
	let searchQuery = $state('');
	let filteredTags = $derived.by(() => {
		return searchQuery != null && searchQuery !== ''
			? sortedTags.filter((key) => key.k.toLowerCase().includes(searchQuery.toLowerCase()))
			: sortedTags;
	});

	// Grouping functionality
	function getKeyPrefix(key: string): string {
		// Extract the first part of the key before a colon
		const match = key.match(/^([^:]+)/);
		return match != null ? match[0] : 'other';
	}

	// Create a function to get the grouped tags to use in derived
	function getGroupedTags(tags: FolksonomyKey[]): [string, FolksonomyKey[]][] {
		const groups: Record<string, FolksonomyKey[]> = {};

		tags.forEach((key) => {
			const prefix = getKeyPrefix(key.k);
			if (groups[prefix] == null) {
				groups[prefix] = [];
			}
			groups[prefix].push(key);
		});
		// Sort groups by name
		return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
	}

	// Fix the typing for groupedTags to be the actual grouped array
	let groupedTags = $derived(getGroupedTags(filteredTags));

	// UI state
	let expandedGroups: Record<string, boolean> = $state({});

	function toggleGroup(group: string) {
		expandedGroups[group] = !expandedGroups[group];
		expandedGroups = { ...expandedGroups }; // Trigger reactivity
	}

	// Handle keyboard events for group headers
	function handleGroupKeyDown(event: KeyboardEvent, group: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleGroup(group);
		}
	}

	// Initialize all groups as expanded
	onMount(() => {
		// Fix: use the computed value, not the function
		for (const [group] of groupedTags) {
			expandedGroups[group] = true;
		}
		expandedGroups = { ...expandedGroups };
	});

	// Calculate key usage metrics for visual representation with safe default values
	const maxCount = $derived(
		data.keys != null && data.keys.length > 0
			? Math.max(...data.keys.map((k) => k?.count || 0), 1)
			: 1
	);

	const maxValues = $derived(
		data.keys != null && data.keys.length > 0
			? Math.max(...data.keys.map((k) => k?.values || 0), 1)
			: 1
	);

	function getUsagePercent(count: number | null | undefined): number {
		return Math.ceil(((count || 0) / maxCount) * 100);
	}

	function getValuesPercent(values: number): number {
		return Math.ceil(((values || 0) / maxValues) * 100);
	}

	function getColorClass(percent: number): string {
		if (percent > 75) return 'badge-primary';
		if (percent > 50) return 'badge-secondary';
		if (percent > 25) return 'badge-accent';
		return 'badge-ghost';
	}
</script>

<div class="folksonomy-container flex flex-col gap-6 sm:p-4" transition:fade={{ duration: 500 }}>
	{#snippet headerSection()}
		<div class="header-section mb-2">
			<h1 class="text-primary mb-4 text-3xl font-bold">
				{$_('folksonomy.title')}
				<span class="text-base font-normal opacity-70">{$_('folksonomy.subtitle')}</span>
			</h1>

			<p class="mb-4 max-w-2xl text-sm opacity-75">
				{$_('folksonomy.description')}
			</p>

			<div class="search-section mb-6">
				<div class="form-control">
					<div class="join w-full max-w-md">
						<input
							type="text"
							placeholder={$_('folksonomy.search_placeholder')}
							class="input input-bordered join-item w-full"
							bind:value={searchQuery}
							transition:fade={{ duration: 200 }}
						/>
						<button class="btn btn-square join-item" aria-label={$_('search.button')}>
							<IconMdiMagnify class="h-6 w-6" />
						</button>
					</div>
				</div>

				<div class="mt-2 text-sm">
					{filteredTags.length}
					{filteredTags.length === 1 ? $_('folksonomy.key_found') : $_('folksonomy.keys_found')}
					{#if searchQuery != null && searchQuery !== ''}
						{$_('folksonomy.for')} "<span class="font-medium">{searchQuery}</span>"
					{/if}
				</div>
			</div>
		</div>
	{/snippet}

	{#snippet emptyState(message: string)}
		<div class="alert alert-info" transition:fade>
			<IconMdiInformationOutline class="h-6 w-6 shrink-0 stroke-current" />
			<span>{message}</span>
		</div>
	{/snippet}

	{#snippet keyCard(key: FolksonomyKey)}
		<div
			class="key-card bg-base-100 border-base-300 rounded-lg border p-3 transition-all duration-300 hover:shadow-lg"
		>
			<a href="/folksonomy/{key.k}" class="hover:text-primary block font-mono transition-colors">
				<div class="mb-2 flex items-center justify-between">
					<span class="truncate text-sm md:text-base" title={key.k}>{key.k}</span>
					<div class="flex gap-1">
						{#if key.count != null && key.count > 0}
							{@const usagePercent = getUsagePercent(key.count)}
							<div
								class="badge badge-sm"
								class:badge-primary={usagePercent > 75}
								class:badge-secondary={usagePercent > 50 && usagePercent <= 75}
								class:badge-accent={usagePercent > 25 && usagePercent <= 50}
								class:badge-ghost={usagePercent <= 25}
								title="Used in {key.count} products ({usagePercent}% relative usage)"
							>
								{key.count}
							</div>
						{/if}
						{#if key.values != null && key.values > 0}
							<div
								class="badge badge-sm {getColorClass(getValuesPercent(key.values))}"
								title="Has {key.values} different possible values"
							>
								{key.values}
							</div>
						{/if}
					</div>
				</div>
				{#if key.count != null && key.count > 0}
					<div
						class="bg-base-300 h-1 w-full overflow-hidden rounded-full"
						title="Usage frequency indicator: {getUsagePercent(key.count)}% relative to other keys"
					>
						<div
							class="bg-primary h-full rounded-full"
							style="width: {getUsagePercent(key.count)}%"
						></div>
					</div>
				{/if}
			</a>
		</div>
	{/snippet}

	{#snippet groupHeader(group: string, keys: FolksonomyKey[])}
		<div
			class="group-header flex cursor-pointer items-center justify-between p-3 font-semibold sm:text-lg"
			role="button"
			tabindex="0"
			aria-expanded={expandedGroups[group] ? 'true' : 'false'}
			onclick={() => toggleGroup(group)}
			onkeydown={(e) => handleGroupKeyDown(e, group)}
		>
			<div class="flex items-center gap-2">
				<span class="break-all">{group}</span>
				<div class="badge">{keys.length}</div>
			</div>
			<button class="btn btn-sm btn-circle" aria-hidden="true">
				{#if expandedGroups[group]}
					<IconMdiChevronUp class="h-6 w-6" />
				{:else}
					<IconMdiChevronDown class="h-6 w-6" />
				{/if}
			</button>
		</div>
	{/snippet}

	{#snippet groupContent(group: string, keys: FolksonomyKey[])}
		{#if expandedGroups[group]}
			<div class="group-keys card-body p-4 pt-0" transition:fade={{ duration: 200 }}>
				<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
					{#each keys as key (key)}
						{@render keyCard(key)}
					{/each}
				</div>
			</div>
		{/if}
	{/snippet}

	{@render headerSection()}

	{#if data.keys == null || data.keys.length === 0}
		{@render emptyState(
			'No Folksonomy keys available. Keys will appear here once they are created.'
		)}
	{:else if filteredTags.length === 0}
		{@render emptyState('No keys found with the current search query.')}
	{:else}
		<div class="bg-base-200 mb-4 rounded-lg p-3 text-sm opacity-75">
			<h3 class="mb-1 font-semibold">Key Visualization Guide:</h3>
			<ul class="ml-4 list-disc">
				<li>
					The first badge <span class="badge badge-sm mr-1 ml-1">123</span> shows the number of products
					using this key
				</li>
				<li>
					The second badge <span class="badge badge-sm badge-accent mr-1 ml-1">45</span> shows the number
					of unique values for this key
				</li>
				<li>The progress bar represents how commonly the key is used relative to other keys</li>
			</ul>
		</div>

		<div class="keys-container">
			{#each groupedTags as [group, keys] (group)}
				<div
					class="group-container card bg-base-200 mb-4 shadow-md"
					transition:fly={{ y: 20, duration: 300 }}
				>
					{@render groupHeader(group, keys)}
					{@render groupContent(group, keys)}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.key-card:hover {
		transform: translateY(-2px);
	}
</style>
