<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import type { FolksonomyKey } from '$lib/api/folksonomy';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	
	// Ensure data.keys exists and has a default empty array if undefined
	let sortedTags = $derived(
		data.keys 
			? [...data.keys].sort((a, b) => a.k.localeCompare(b.k)) 
			: []
	);
	
	// Search functionality
	let searchQuery = $state('');
	let filteredTags = $derived(
		searchQuery 
			? sortedTags.filter(key => key.k.toLowerCase().includes(searchQuery.toLowerCase())) 
			: sortedTags
	);
	
	// Grouping functionality
	function getKeyPrefix(key: string): string {
		// Extract the first part of the key before a colon or underscore
		const match = key.match(/^([^:_]+)/);
		return match ? match[0] : 'other';
	}
	
	// Create a function to get the grouped tags to use in derived
	function getGroupedTags(tags: FolksonomyKey[]): [string, FolksonomyKey[]][] {
		const groups: Record<string, FolksonomyKey[]> = {};
		
		tags.forEach(key => {
			const prefix = getKeyPrefix(key.k);
			if (!groups[prefix]) {
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
		expandedGroups = {...expandedGroups}; // Trigger reactivity
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
		expandedGroups = {...expandedGroups};
	});
	
	// Calculate key usage metrics for visual representation with safe default values
	const maxCount = $derived(
		data.keys && data.keys.length > 0
			? Math.max(...data.keys.map(k => k?.count || 0), 1)
			: 1
	);
	
	const maxValues = $derived(
		data.keys && data.keys.length > 0
			? Math.max(...data.keys.map(k => k?.values || 0), 1)
			: 1
	);
	
	function getUsagePercent(count: number): number {
		return Math.ceil(((count || 0) / maxCount) * 100);
	}
	
	function getValuesPercent(values: number): number {
		return Math.ceil(((values || 0) / maxValues) * 100);
	}
	
	function getColorClass(percent: number): string {
		if (percent > 75) return "badge-primary";
		if (percent > 50) return "badge-secondary";
		if (percent > 25) return "badge-accent";
		return "badge-ghost";
	}
	
	function handleSearch() {
		// This function can be used for additional search functionality if needed
		console.log('Searching for:', searchQuery);
	}
</script>

<div class="folksonomy-container flex flex-col gap-6 p-4">
	<div class="header-section mb-2">
		<h1 class="text-3xl font-bold mb-4 text-primary">
			Folksonomy Engine 
			<span class="text-base font-normal opacity-70">Keys Explorer</span>
		</h1>
		
		<p class="text-sm opacity-75 mb-4 max-w-2xl">
			Folksonomy allows users to add custom tags to products. Browse all available keys below, 
			search for specific keys, or click on any key to see products that use it.
		</p>
		
		<div class="search-section mb-6">
			<div class="form-control">
				<div class="input-group">
					<input 
						type="text" 
						placeholder="Search keys..." 
						class="input input-bordered w-full max-w-md"
						bind:value={searchQuery}
						transition:fade={{duration: 200}}
					/>
					<button 
						class="btn btn-square" 
						aria-label="Search folksonomy keys"
						onclick={handleSearch}
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</button>
				</div>
			</div>
			
			<div class="mt-2 text-sm">
				{filteredTags.length} {filteredTags.length === 1 ? 'key' : 'keys'} found
				{#if searchQuery}
					for "<span class="font-medium">{searchQuery}</span>"
				{/if}
			</div>
		</div>
	</div>
	
	{#if !data.keys || data.keys.length === 0}
		<div class="alert alert-info" transition:fade>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<span>No Folksonomy keys available. Keys will appear here once they are created.</span>
		</div>
	{:else if filteredTags.length === 0}
		<div class="alert alert-info" transition:fade>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<span>No keys found with the current search query.</span>
		</div>
	{:else}
		<div class="keys-container">
			{#each groupedTags as [group, keys]}
				<div class="group-container mb-4 card bg-base-200 shadow-md" transition:fly={{y: 20, duration: 300}}>
					<div 
						class="group-header p-3 font-semibold text-lg cursor-pointer flex justify-between items-center"
						role="button"
						tabindex="0"
						aria-expanded={expandedGroups[group] ? "true" : "false"}
						onclick={() => toggleGroup(group)}
						onkeydown={(e) => handleGroupKeyDown(e, group)}
					>
						<div class="flex items-center gap-2">
							<span>{group}</span>
							<div class="badge">{keys.length}</div>
						</div>
						<button class="btn btn-sm btn-circle" aria-hidden="true">
							{#if expandedGroups[group]}
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
								</svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12M6 12h12" />
								</svg>
							{/if}
						</button>
					</div>
					
					{#if expandedGroups[group]}
						<div class="group-keys card-body p-4 pt-0" transition:fade={{duration: 200}}>
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
								{#each keys as key}
									<div class="key-card bg-base-100 p-3 rounded-lg hover:shadow-lg transition-all duration-300 border border-base-300">
										<a 
											href="/folksonomy/{key.k}" 
											class="block font-mono hover:text-primary transition-colors"
										>
											<div class="flex justify-between items-center mb-2">
												<span class="text-sm md:text-base truncate" title="{key.k}">{key.k}</span>
												<div class="flex gap-1">
													{#if key.count && key.count > 0}
														<div class="badge badge-sm {getColorClass(getUsagePercent(key.count))}" title="Number of products: {key.count}">
															{key.count}
														</div>
													{/if}
													{#if key.values && key.values > 0}
														<div class="badge badge-sm {getColorClass(getValuesPercent(key.values))}" title="Number of unique values: {key.values}">
															{key.values}
														</div>
													{/if}
												</div>
											</div>
											{#if key.count && key.count > 0}
												<div class="w-full bg-base-300 h-1 rounded-full overflow-hidden">
													<div class="bg-primary h-full rounded-full" style="width: {getUsagePercent(key.count)}%"></div>
												</div>
											{/if}
										</a>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.folksonomy-container {
		animation: fadeIn 0.5s ease-in-out;
	}
	
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	
	.key-card:hover {
		transform: translateY(-2px);
	}
</style>
