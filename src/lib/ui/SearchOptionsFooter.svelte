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

<footer class="sticky bottom-0 left-0 w-full bg-base-100 border-t border-base-200 z-50 flex flex-col items-center justify-between px-0 h-14 min-h-0 lg:hidden mt-4">
    {#if isSortDropdownOpen}
        <div class="absolute bottom-14 left-0 right-0 w-full bg-base-100 border border-base-200 rounded-t-lg shadow-xl z-50 animate-fade-in-up max-h-80 overflow-y-auto py-2">
            <div class="px-4 pb-2 text-sm font-bold text-gray-500 tracking-wide my-2">SORT BY</div>
            {#each SORT_OPTIONS as option}
                <button
                    class="w-full flex items-center gap-3 px-4 py-2 hover:bg-base-200 text-sm"
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
    <div class="flex w-full h-full">
        <button
            class="flex flex-col items-center justify-center w-1/2 py-1 border-r border-base-200 focus:outline-none h-full"
            onclick={onSortClick}
            aria-label="Sort"
        >
            <span class="text-sm font-semibold tracking-wide leading-tight">Sort</span>
        </button>
        <!-- TODO: Add onFilterClick handler and logic for filter functionality -->
        <button
            class="flex flex-col items-center justify-center w-1/2 py-1 focus:outline-none h-full"
            aria-label="Filter"
        >
            <span class="text-sm font-semibold tracking-wide leading-tight">Filter</span>
        </button>
    </div>
</footer>

