<script lang="ts">
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';

	import { _ } from '$lib/i18n';

	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';

	import { SORT_OPTIONS } from '$lib/const';

	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Metadata from '$lib/Metadata.svelte';
	import SearchOptionsFooter from '$lib/ui/SearchOptionsFooter.svelte';
	import FacetBar from './FacetBar.svelte';

	import type { PageData } from './$types';
	import {
		addIncludeFacet,
		extractQuery,
		removeIncludeFacet,
		toLuceneString,
		type FacetsSelection
	} from '$lib/facets';

	type Props = { data: PageData };
	let { data }: Props = $props();
	let { search: result } = $derived(data);

	// Update facets when search results change or facetBarComponent changes
	$effect(() => {
		// Track search queries that return no results
		console.debug('Search result:', result);
		if (result.count == 0) $tracker.trackEvent('Product Search', 'No Results', data.query);
	});

	let selectedSort = $derived.by(() => {
		const url = new URL(page.url);
		const sortValue = url.searchParams.get('sort_by') || '-unique_scans_n';
		return SORT_OPTIONS.find((opt) => opt.value === sortValue) || SORT_OPTIONS[0];
	});

	let sortDropdown: HTMLDetailsElement | null = $state(null);

	function getSelectedSortLabel() {
		return selectedSort.label;
	}

	function handleSortChange(value: string) {
		if (sortDropdown) sortDropdown.open = false; // Close the dropdown

		selectedSort = SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];
		const newUrl = new URL(page.url);
		newUrl.searchParams.set('sort_by', selectedSort.value);
		goto(newUrl.toString());
	}

	// State to hold selected facets
	//  { key1 => { include: ['value1', 'value2'], exclude: ['value3'] } }
	let selectedFacets: FacetsSelection = $derived.by(() => {
		const entries = Object.entries(result.facets).map(([key, facet]) => {
			const selectedItems = facet.items.filter((item) => item.selected).map((item) => item.key);
			return [key, { include: selectedItems, exclude: [] }];
		});
		return Object.fromEntries(entries);
	});

	function refreshQuery() {
		// recreate the full lucene query with selected facets
		const mainQuery = extractQuery(data.query);
		const newQuery = toLuceneString(mainQuery, selectedFacets);

		const newUrl = new URL(page.url);
		newUrl.searchParams.set('q', newQuery);
		goto(newUrl.toString());
	}
</script>

<Metadata
	title={$_('search.title', { values: { query: data.query } })}
	description={$_('search.description', { values: { query: data.query } })}
/>

<div class="mb-4 flex w-full items-end justify-center gap-2 max-md:flex-col">
	<div class="flex-1 max-md:w-full">
		<label>
			Raw Search Query:
			<input
				type="text"
				placeholder={$_('search.search_placeholder')}
				class="input wrap w-full font-mono break-words"
				value={data.query}
				disabled
			/>
		</label>
	</div>

	<!-- Sort By Dropdown -->
	<div class="flex-0 max-lg:hidden">
		Sort by:
		<details class="dropdown dropdown-center md:w-50 lg:w-60" bind:this={sortDropdown}>
			<summary
				class="btn btn-outline btn-sm m-1 flex w-full items-center justify-start gap-2 text-xs lg:text-sm"
			>
				<span class="inline-block truncate align-middle font-semibold">
					{getSelectedSortLabel()}
				</span>
				<i class="icon-[mdi--chevron-down] text-xl"></i>
			</summary>
			<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow">
				{#each SORT_OPTIONS as { label, value } (value)}
					<li>
						<button class="w-full text-left" onclick={() => handleSortChange(value)}>
							{label}
						</button>
					</li>
				{/each}
			</ul>
		</details>
	</div>
</div>

{#if result.facets && Object.keys(result.facets).length > 0}
	<div class="my-4">
		<FacetBar
			facets={result.facets}
			onAddFacet={(key, val) => {
				selectedFacets = addIncludeFacet(selectedFacets, key, val);
				refreshQuery();
			}}
			onRemoveFacet={(key, val) => {
				selectedFacets = removeIncludeFacet(selectedFacets, key, val);
				refreshQuery();
			}}
		/>
	</div>
{/if}

{#if result.count > 0}
	<!-- Facet component with binding to access its methods -->

	<div class="relative mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each result.hits as product (product.code)}
			<SmallProductCard {product} />
		{/each}
		{#if navigating.to != null}
			<div
				class="bg-base-100/70 absolute inset-0 z-10 flex cursor-not-allowed items-start justify-center"
			>
				<span class="loading loading-spinner loading-lg mt-10"></span>
			</div>
		{/if}
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

<!-- Sticky SORT & FILTER Footer -->
<SearchOptionsFooter
	onSortOptionSelect={(value) => handleSortChange(value)}
	sortBy={selectedSort.value}
/>
