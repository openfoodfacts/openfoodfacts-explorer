<script lang="ts">
	import { SORT_OPTIONS } from '../const';

	export let isSortDropdownOpen: boolean;
	export let onSortClick: () => void = () => {};
	export let onSortOptionSelect: (value: string) => void = () => {};
	export let selectedSort: string = '';

	function handleSortOptionClick(value: string) {
		onSortOptionSelect(value);
	}
</script>

<footer
	class="bg-base-100 border-base-200 sticky bottom-0 left-0 z-50 mt-4 flex h-14 min-h-0 w-full flex-col items-center justify-between border-t px-0 lg:hidden"
>
	{#if isSortDropdownOpen}
		<div
			class="bg-base-100 border-base-200 animate-fade-in-up absolute right-0 bottom-14 left-0 z-50 max-h-80 w-full overflow-y-auto rounded-t-lg border py-2 shadow-xl"
		>
			<div class="my-2 px-4 pb-2 text-sm font-bold tracking-wide text-gray-500">SORT BY</div>
			{#each SORT_OPTIONS as option}
				<button
					class="hover:bg-base-200 flex w-full items-center gap-3 px-4 py-2 text-sm"
					class:bg-base-200={selectedSort === option.value}
					onclick={() => handleSortOptionClick(option.value)}
				>
					<span>{option.label}</span>
					{#if selectedSort === option.value}
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
			<span class="text-sm leading-tight font-semibold tracking-wide">Sort</span>
		</button>
		<!-- TODO: Add onFilterClick handler and logic for filter functionality -->
		<button
			class="flex h-full w-1/2 flex-col items-center justify-center py-1 focus:outline-none"
			aria-label="Filter"
		>
			<span class="text-sm leading-tight font-semibold tracking-wide">Filter</span>
		</button>
	</div>
</footer>
