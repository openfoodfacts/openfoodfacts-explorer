<script lang="ts">
	import { page } from '$app/state';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import { _ } from '$lib/i18n';
	import type { PageData } from './$types';
	import Pagination from '$lib/Pagination.svelte';
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';
	import Metadata from '$lib/Metadata.svelte';
	import FacetBar from '$lib/ui/FacetBar.svelte';
	import { goto } from '$app/navigation';
	import { SORT_OPTIONS } from '$lib/const';
	import SearchOptionsFooter from '$lib/ui/SearchOptionsFooter.svelte';
	
	let facetBarComponent: any = $state(null);
	
	let selectedFacets: Array<{
		facetKey: string;
		facetName: string;
		itemKey: string;
		itemName: string;
	}> = $state([]);


	type Props = { data: PageData };
	let { data }: Props = $props();

	let { search } = $derived(data);

	// Update facets when search results change or facetBarComponent changes
	$effect(() => {
		// This effect will run when facetBarComponent changes or when search results update
		if (facetBarComponent) {
			try {
				selectedFacets = facetBarComponent.getSelectedFacets();
			} catch (error) {
				console.error('Error updating selected facets:', error);
			}
			
			search.then((result) => {
				if (result.count == 0) $tracker.trackEvent('Product Search', 'No Results', data.query);
				
				try {
					selectedFacets = facetBarComponent.getSelectedFacets();
				} catch (error) {
					console.error('Error updating facets after search:', error);
				}
			});
		}
	});

	let selectedSort = $derived.by(() => {
		const url = new URL(page.url);
		const sortValue = url.searchParams.get('sort_by') || '-unique_scans_n';
		return SORT_OPTIONS.find((opt) => opt.value === sortValue) || SORT_OPTIONS[0];
	});

	let isSortDropdownOpen: boolean = $state(false);

	function getSelectedSortLabel() {
		return selectedSort.label;
	}

	function handleSortChange(value: string) {
		selectedSort = SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];
		isSortDropdownOpen = false;
		const newUrl = new URL(page.url);
		newUrl.searchParams.set('sort_by', selectedSort.value);
		goto(newUrl.toString());
	}
	
	// Handle removing a facet badge
	function handleRemoveFacet(facetKey: string, itemKey: string) {
		if (facetBarComponent) {
			facetBarComponent.removeFacet(facetKey, itemKey);
		}
	}

	function handleFacetChange(event: CustomEvent<{ facetKey: string; selectedItems: string[] }>) {
		const { facetKey, selectedItems } = event.detail;
		const newUrl = new URL(page.url);
		const query = newUrl.searchParams.get('q') || '';

		// Get current URL query and remove any existing facet filters for this key
		let baseQuery = query
			.replace(new RegExp(`\\s*${facetKey}\\s*:\\s*\\([^)]*\\)`, 'g'), '')
			.replace(new RegExp(`\\s*AND\\s*${facetKey}\\s*:\\s*"[^"]*"`, 'g'), '')
			.replace(new RegExp(`\\s*${facetKey}\\s*:\\s*"[^"]*"`, 'g'), '')
			.trim();

		// Add new facet filter if items are selected
		if (selectedItems.length > 0) {
			if (selectedItems.length === 1) {
				baseQuery += ` ${baseQuery ? 'AND ' : ''}${facetKey}:"${selectedItems[0]}"`;
			} else {
				const facetQuery = `${facetKey}:(${selectedItems.join(' OR ')})`;
				baseQuery += ` ${baseQuery ? 'AND ' : ''}${facetQuery}`;
			}
		}

		// Update the URL with the new query
		newUrl.searchParams.set('q', baseQuery);
		goto(newUrl.toString());
	}
</script>

<Metadata
	title={$_('search.title', { values: { query: data.query } })}
	description={$_('search.description', { values: { query: data.query } })}
/>

<!-- Sort By Dropdown -->
<div class="my-4 hidden justify-end lg:flex">
	<div class="dropdown dropdown-center md:w-50 lg:w-60">
		<button
			class="btn btn-outline btn-sm m-1 flex w-full items-center justify-start gap-2 text-xs lg:text-sm"
			onclick={() => (isSortDropdownOpen = !isSortDropdownOpen)}
		>
			Sort by
			{#if getSelectedSortLabel()}
				: <span
					class="inline-block truncate align-middle font-semibold md:max-w-20 lg:max-w-30"
					title={getSelectedSortLabel()}>{getSelectedSortLabel()}</span
				>
			{/if}
			<i class="icon-[mdi--chevron-down] text-xl"></i>
		</button>
		{#if isSortDropdownOpen}
			<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow">
				{#each SORT_OPTIONS as { label, value } (value)}
					<li>
						<button class="w-full text-left" onclick={() => handleSortChange(value)}>
							{label}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

{#await search}
	<div
		class="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-3"
	>
		{#each Array(6) as _, i (i)}
			<div class="skeleton dark:bg-base-300 h-24 bg-white p-4 shadow-md"></div>
		{/each}
	</div>
{:then result}
	{#if result.count > 0}
		<!-- Selected facets badges section -->
		{#if selectedFacets.length > 0}
			<div class="flex flex-wrap items-center gap-2 mb-4">
				<span class="font-medium">Active filters:</span>
				{#each selectedFacets as selectedFacet (selectedFacet.facetKey + '-' + selectedFacet.itemKey)}
					<div class="badge badge-secondary gap-1 p-3">
						<span>{selectedFacet.itemName}</span>
						<button 
							type="button" 
							class="btn btn-ghost btn-xs btn-circle" 
							aria-label="Remove filter"
							onclick={() => handleRemoveFacet(selectedFacet.facetKey, selectedFacet.itemKey)}
						>
							<i class="icon-[mdi--close] text-xs"></i>
						</button>
					</div>
				{/each}
			</div>
		{/if}
		
		<!-- Facet component with binding to access its methods -->
		<FacetBar 
			facets={result.facets as any} 
			on:facetChange={handleFacetChange} 
			bind:this={facetBarComponent} 
		/>
		
		<div
			class="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-3"
		>
			{#each result.hits as product (product.code)}
				<SmallProductCard {product} />
			{/each}
		</div>

		<!-- Pagination -->
		<div class="mt-8">
			<Pagination
				page={result.page}
				totalPages={result.page_count}
				pageUrl={(p: number) => {
					const newUrl = new URL(page.url);
					newUrl.searchParams.set('page', p.toString());
					return newUrl.toString();
				}}
			/>
		</div>
	{:else}
		<div
			class="flex w-full grid-cols-1 flex-col items-center gap-4 py-50 md:h-auto md:pt-20 md:pb-30 lg:gap-2"
		>
			<p class="mb-4 text-3xl font-bold">{$_('search.product_not_found')}</p>
			<p>{$_('search.product_not_found_desc')}</p>
		</div>
	{/if}
{/await}

<!-- Sticky SORT & FILTER Footer -->
<SearchOptionsFooter
	{isSortDropdownOpen}
	onSortClick={() => (isSortDropdownOpen = !isSortDropdownOpen)}
	onSortOptionSelect={(value) => handleSortChange(value)}
	sortBy={selectedSort.value}
/>
