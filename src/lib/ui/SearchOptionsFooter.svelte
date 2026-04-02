<script lang="ts">
	import { SORT_OPTIONS } from '$lib/const';

	import IconMdiSort from '@iconify-svelte/mdi/sort';
	import IconMdiFilter from '@iconify-svelte/mdi/filter';
	import IconMdiCheck from '@iconify-svelte/mdi/check';

	let {
		onSortOptionSelect = () => {},
		sortBy = '',
		availableFilters = [],
		onApplyFilters = () => {}
	}: {
		onSortOptionSelect: (value: string) => void;
		sortBy: string;
		availableFilters: {
			key: string;
			name: string;
			items: { key: string; name: string; selected: boolean; count: number }[];
		}[];
		onApplyFilters: (selectedItems: { facetKey: string; itemKey: string }[]) => void;
	} = $props();

	let sortDropdownOpen = $state(false);
	let filterDropdownOpen = $state(false);
	let selectedFilters = $state<{ facetKey: string; itemKey: string }[]>([]);

	function openFilterDropdown() {
		selectedFilters = availableFilters.flatMap((facet) =>
			facet.items
				.filter((item) => item.selected)
				.map((item) => ({ facetKey: facet.key, itemKey: item.key }))
		);
		filterDropdownOpen = true;
	}

	function toggleFilter(facetKey: string, itemKey: string) {
		const exists = selectedFilters.some((f) => f.facetKey === facetKey && f.itemKey === itemKey);
		if (exists) {
			selectedFilters = selectedFilters.filter(
				(f) => !(f.facetKey === facetKey && f.itemKey === itemKey)
			);
		} else {
			selectedFilters = [...selectedFilters, { facetKey, itemKey }];
		}
	}

	function applyFilters() {
		onApplyFilters(selectedFilters);
		filterDropdownOpen = false;
	}
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

	{#if filterDropdownOpen}
		<div
			class="bg-base-100 border-base-200 absolute right-0 bottom-14 left-0 z-50 max-h-80 w-full overflow-y-auto rounded-t-lg border py-2 shadow-xl"
		>
			<div class="my-2 px-4 pb-2 text-sm font-bold tracking-wide text-gray-500">FILTER BY</div>

			{#each availableFilters as facet (facet.key)}
				<div class="border-base-200 border-b px-4 py-2">
					<div class="text-sm font-semibold">{facet.name}</div>
					{#each facet.items.slice(0, 5) as item (item.key)}
						<button
							class="hover:bg-base-200 flex w-full items-center gap-3 px-2 py-1 text-sm"
							class:bg-base-200={selectedFilters.some(
								(f) => f.facetKey === facet.key && f.itemKey === item.key
							)}
							onclick={() => toggleFilter(facet.key, item.key)}
						>
							<span class="checkbox-wrapper">
								{#if selectedFilters.some((f) => f.facetKey === facet.key && f.itemKey === item.key)}
									<IconMdiCheck class="h-4 w-4" />
								{/if}
							</span>
							<span class="flex-1 text-left">{item.name}</span>
							<span class="text-xs text-gray-500">({item.count})</span>
						</button>
					{/each}
				</div>
			{/each}

			<div class="mt-2 flex gap-2 border-t px-4 pt-3">
				<button class="btn btn-primary btn-sm flex-1" onclick={applyFilters}>Apply</button>
				<button class="btn btn-ghost btn-sm flex-1" onclick={() => (filterDropdownOpen = false)}
					>Cancel</button
				>
			</div>
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
		<button
			class="flex h-full w-1/2 flex-col items-center justify-center py-1 focus:outline-none"
			onclick={() => {
				filterDropdownOpen = !filterDropdownOpen;
				sortDropdownOpen = false;
				if (filterDropdownOpen) openFilterDropdown();
			}}
			aria-label="Filter"
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
		@apply bg-base-100 border-base-200 sticky bottom-0 left-0 z-50 mt-4 flex h-14 min-h-0 w-full flex-col items-center justify-between border-t px-0 lg:hidden;
	}

	.checkbox-wrapper {
		@apply flex h-4 w-4 items-center justify-center rounded border border-gray-300;
	}
</style>
