<script lang="ts">
	import { SORT_OPTIONS } from '$lib/const';
	import { _ } from '$lib/i18n';

	import IconMdiSort from '@iconify-svelte/mdi/sort';
	import IconMdiFilter from '@iconify-svelte/mdi/filter';
	import IconMdiClose from '@iconify-svelte/mdi/close';

	import FacetBar from '../../routes/search/FacetBar.svelte';
	import type { SearchResult } from '$lib/api/search';

	import type { FacetsSelection } from '$lib/facets';

	interface Props {
		onSortOptionSelect?: (value: string) => void;
		sortBy?: string;
		onFilterClick?: () => void;
		searchResult?: SearchResult;
		selectedFacets?: FacetsSelection;
		onToggleInclude?: (key: string, val: string) => void;
		onToggleExclude?: (key: string, val: string) => void;
	}

	let {
		onSortOptionSelect = () => {},
		sortBy = '',
		onFilterClick = () => {},
		searchResult,
		selectedFacets = {},
		onToggleInclude = () => {},
		onToggleExclude = () => {}
	}: Props = $props();

	let sortDropdownOpen = $state(false);
	let filterDropdownOpen = $state(false);

	function toggleSort() {
		sortDropdownOpen = !sortDropdownOpen;
		if (sortDropdownOpen) filterDropdownOpen = false;
	}

	function toggleFilter() {
		filterDropdownOpen = !filterDropdownOpen;
		if (filterDropdownOpen) sortDropdownOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			sortDropdownOpen = false;
			filterDropdownOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<footer class="search-options-footer">
	{#if sortDropdownOpen}
		<div
			class="animate-fade-in-up absolute right-0 bottom-14 left-0 z-50 max-h-80 w-full overflow-y-auto rounded-t-xl border border-base-200 bg-base-100 py-2 shadow-2xl"
		>
			<div class="my-2 px-4 pb-2 text-sm font-bold tracking-wide text-base-content/60">
				{$_('search.sort_by_label')}
			</div>
			{#each SORT_OPTIONS as option (option.value)}
				<button
					class="flex w-full items-center justify-between px-4 py-2.5 text-sm hover:bg-base-200"
					class:bg-base-200={sortBy === option.value}
					onclick={() => {
						onSortOptionSelect(option.value);
						sortDropdownOpen = false;
					}}
				>
					<span>{option.label}</span>
					{#if sortBy === option.value}
						<span class="text-lg font-bold text-primary">✓</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	{#if filterDropdownOpen}
		<div
			class="animate-fade-in-up absolute right-0 bottom-14 left-0 z-50 max-h-[75vh] w-full overflow-y-auto rounded-t-xl border border-base-200 bg-base-100 p-4 shadow-2xl"
		>
			<div class="mb-3 flex items-center justify-between border-b border-base-200 pb-2">
				<h3 class="text-base font-bold tracking-wide text-base-content/90">
					{$_('search.filters_title', { default: 'Filters' })}
				</h3>
				<button
					class="btn btn-circle btn-ghost btn-xs"
					onclick={() => (filterDropdownOpen = false)}
					aria-label="Close filters"
				>
					<IconMdiClose class="h-4 w-4" />
				</button>
			</div>
			{#if searchResult?.facets && Object.keys(searchResult.facets).length > 0}
				<FacetBar
					facets={searchResult.facets}
					{selectedFacets}
					{onToggleInclude}
					{onToggleExclude}
				/>
			{:else}
				<div class="p-4 text-center text-sm text-base-content/60">
					{$_('search.no_facets_available', { default: 'No filters available' })}
				</div>
			{/if}
		</div>
	{/if}

	<div class="flex h-full w-full">
		<button
			class="flex h-full w-1/2 flex-col items-center justify-center border-r border-base-200 py-1 focus:outline-none"
			onclick={toggleSort}
			aria-label="Sort"
			aria-expanded={sortDropdownOpen}
		>
			<span class="flex items-center text-sm leading-tight font-semibold tracking-wide">
				Sort <IconMdiSort class="ml-2 text-lg" />
			</span>
		</button>
		<button
			class="flex h-full w-1/2 flex-col items-center justify-center py-1 focus:outline-none"
			aria-label="Filter"
			aria-expanded={filterDropdownOpen}
			onclick={() => {
				if (searchResult?.facets && Object.keys(searchResult.facets).length > 0) {
					toggleFilter();
				} else {
					onFilterClick();
				}
			}}
		>
			<span class="flex items-center text-sm leading-tight font-semibold tracking-wide">
				Filter <IconMdiFilter class="ml-2 text-lg" />
			</span>
		</button>
	</div>
</footer>

<style lang="postcss">
	@reference './../../app.css';

	.search-options-footer {
		@apply sticky bottom-0 left-0 z-50 mt-4 flex h-14 min-h-0 w-full flex-col items-center justify-between border-t border-base-200 bg-base-100 px-0 lg:hidden;
	}
</style>
