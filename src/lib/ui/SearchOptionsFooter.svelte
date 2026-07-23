<script lang="ts">
	import { SORT_OPTIONS } from '$lib/const';
	import { _ } from '$lib/i18n';

	import IconMdiSort from '@iconify-svelte/mdi/sort';
	import IconMdiFilter from '@iconify-svelte/mdi/filter';

	import FacetBar from '../../routes/search/FacetBar.svelte';
	import type { SearchResult } from '$lib/api/search';

	interface Props {
		onSortOptionSelect?: (value: string) => void;
		sortBy?: string;
		onFilterClick?: () => void;
		searchResult?: SearchResult;
		onAddFacet?: (key: string, val: string) => void;
		onRemoveFacet?: (key: string, val: string) => void;
	}

	let {
		onSortOptionSelect = () => {},
		sortBy = '',
		onFilterClick = () => {},
		searchResult,
		onAddFacet = () => {},
		onRemoveFacet = () => {}
	}: Props = $props();

	let sortDropdownOpen = $state(false);
	let showFacetsModal = $state(false);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && showFacetsModal) {
			showFacetsModal = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<footer class="search-options-footer">
	{#if sortDropdownOpen}
		<div
			class="bg-base-100 border-base-200 animate-fade-in-up absolute right-0 bottom-14 left-0 z-50 max-h-80 w-full overflow-y-auto rounded-t-lg border py-2 shadow-xl"
		>
			<div class="text-base-content/60 my-2 px-4 pb-2 text-sm font-bold tracking-wide">
				{$_('search.sort_by_label')}
			</div>
			{#each SORT_OPTIONS as option (option.value)}
				<button
					class="hover:bg-base-200 flex w-full items-center gap-3 px-4 py-2 text-sm"
					class:bg-base-200={sortBy === option.value}
					onclick={() => {
						onSortOptionSelect(option.value);
						sortDropdownOpen = false;
					}}
				>
					<span>{option.label}</span>
					{#if sortBy === option.value}
						<span class="text-lg">✓</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}

	{#if showFacetsModal && searchResult?.facets}
		<div
			class="bg-base-100 border-base-200 animate-fade-in-up absolute right-0 bottom-14 left-0 z-50 max-h-[70vh] w-full overflow-y-auto rounded-t-lg border shadow-xl"
		>
			<div class="bg-base-100 sticky top-0 z-10 flex items-center justify-between p-4 pb-2">
				<h3 class="text-lg font-semibold">{$_('search.filters_title', { default: 'Filters' })}</h3>
				<button
					class="btn btn-ghost btn-sm"
					onclick={() => (showFacetsModal = false)}
					aria-label="Close filters">✕</button
				>
			</div>
			<div class="space-y-2 p-4 pt-0">
				<FacetBar facets={searchResult.facets} {onAddFacet} {onRemoveFacet} />
			</div>
		</div>
	{/if}

	<div class="flex h-full w-full">
		<button
			class="border-base-200 flex h-full w-1/2 flex-col items-center justify-center border-r py-1 focus:outline-none"
			onclick={() => {
				sortDropdownOpen = !sortDropdownOpen;
				showFacetsModal = false;
			}}
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
			aria-controls="facets"
			onclick={() => {
				sortDropdownOpen = false;
				if (searchResult?.facets && Object.keys(searchResult.facets).length > 0) {
					showFacetsModal = !showFacetsModal;
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
