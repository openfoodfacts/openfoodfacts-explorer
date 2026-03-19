<script lang="ts">
	import { SORT_OPTIONS } from '$lib/const';
	import { _ } from '$lib/i18n';

	import IconMdiSort from '@iconify-svelte/mdi/sort';
	import IconMdiFilter from '@iconify-svelte/mdi/filter';

	import type { SearchResult } from '$lib/api/search';
	import type { Snippet } from 'svelte';

	interface Props {
		onSortOptionSelect?: (value: string) => void;
		sortBy?: string;
		onFilterClick?: () => void;
		searchResult?: SearchResult;
		children?: Snippet<[{ facets: Record<string, any>; close: () => void }]>;
	}

	let {
		onSortOptionSelect = () => {},
		sortBy = '',
		onFilterClick = () => {},
		searchResult,
		children
	}: Props = $props();

	let sortDropdownOpen = $state(false);
	let showFacetsModal = $state(false);
</script>

<footer class="search-options-footer">
	{#if sortDropdownOpen}
		<div
			class="bg-base-100 border-base-200 animate-fade-in-up absolute right-0 bottom-14 left-0 z-50 max-h-80 w-full overflow-y-auto rounded-t-lg border py-2 shadow-xl"
		>
			<div class="my-2 px-4 pb-2 text-sm font-bold tracking-wide text-gray-500">SORT BY</div>
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
	<div class="flex h-full w-full">
		<button
			class="border-base-200 flex h-full w-1/2 flex-col items-center justify-center border-r py-1 focus:outline-none"
			onclick={() => {
				sortDropdownOpen = !sortDropdownOpen;
			}}
			aria-label="Sort"
		>
			<span class="flex items-center text-sm leading-tight font-semibold tracking-wide">
				Sort <IconMdiSort class="ml-2 text-lg" />
			</span>
		</button>
		<!-- TODO: Add onFilterClick handler and logic for filter functionality -->
		<button
			class="flex h-full w-1/2 flex-col items-center justify-center py-1 focus:outline-none"
			aria-label="Filter"
			aria-controls="facets"
			onclick={() => {
				if (searchResult?.facets && Object.keys(searchResult.facets).length > 0) {
					showFacetsModal = true;
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

{#if showFacetsModal && searchResult?.facets}
	<div class="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true">
		<div
			class="fixed inset-0 bg-black/50"
			onclick={() => (showFacetsModal = false)}
			aria-hidden="true"
		></div>
		<div class="bg-base-100 max-h-[80%] w-full overflow-auto rounded-t-lg p-4">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-lg font-semibold">{$_('search.filters_title', { default: 'Filters' })}</h3>
				<button
					class="btn btn-ghost"
					onclick={() => (showFacetsModal = false)}
					aria-label="Close filters">✕</button
				>
			</div>
			<div class="space-y-2">
				{@render children?.({
					facets: searchResult.facets,
					close: () => (showFacetsModal = false)
				})}
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	@reference './../../app.css';

	.search-options-footer {
		@apply bg-base-100 border-base-200 sticky bottom-0 left-0 z-50 mt-4 flex h-14 min-h-0 w-full flex-col items-center justify-between border-t px-0 lg:hidden;
	}
</style>
