<script lang="ts">
	import { SORT_OPTIONS } from '$lib/const';

	let {
		isSortDropdownOpen,
		onSortClick = () => {},
		onSortOptionSelect = () => {},
		sortBy = ''
	}: {
		isSortDropdownOpen: boolean;
		onSortClick: () => void;
		onSortOptionSelect: (value: string) => void;
		sortBy: string;
	} = $props();
</script>

<style lang="postcss">
	@reference './../../app.css';

	.search-options-footer {
		@apply bg-base-100 border-base-200 sticky bottom-0 left-0 z-50 mt-4 flex h-14 min-h-0 w-full flex-col items-center justify-between border-t px-0 lg:hidden;
	}
</style>

<footer class="search-options-footer">
	{#if isSortDropdownOpen}
		<div
			class="bg-base-100 border-base-200 animate-fade-in-up absolute right-0 bottom-14 left-0 z-50 max-h-80 w-full overflow-y-auto rounded-t-lg border py-2 shadow-xl"
		>
			<div class="my-2 px-4 pb-2 text-sm font-bold tracking-wide text-gray-500">SORT BY</div>
			{#each SORT_OPTIONS as option (option.value)}
				<button
					class="hover:bg-base-200 flex w-full items-center gap-3 px-4 py-2 text-sm"
					class:bg-base-200={sortBy === option.value}
					onclick={() => onSortOptionSelect(option.value)}
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
			onclick={onSortClick}
			aria-label="Sort"
		>
			<span class="flex items-center text-sm leading-tight font-semibold tracking-wide"
				>Sort <i class="icon-[mdi--sort] ml-2 text-lg"></i></span
			>
		</button>
		<!-- TODO: Add onFilterClick handler and logic for filter functionality -->
		<button
			class="flex h-full w-1/2 flex-col items-center justify-center py-1 focus:outline-none"
			aria-label="Filter"
		>
			<span class="flex items-center text-sm leading-tight font-semibold tracking-wide"
				>Filter <i class="icon-[mdi--filter] ml-2 text-lg"></i></span
			>
		</button>
	</div>
</footer>