<script lang="ts">
	import { page } from '$app/state';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import { _ } from '$lib/i18n';
	import type { PageData } from './$types';
	import Pagination from '$lib/Pagination.svelte';
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';
	import Metadata from '$lib/Metadata.svelte';
	import { goto } from '$app/navigation';
	import { SORT_OPTIONS } from '$lib/const';
	import SearchOptionsFooter from '$lib/ui/SearchOptionsFooter.svelte';

	type Props = { data: PageData };
	let { data }: Props = $props();

	$effect(() => {
		data.search.then((result) => {
			if (result.count == 0) $tracker.trackEvent('Product Search', 'No Results', data.query);
		});
	});

	let { search } = $derived(data);

	let selectedSort: string = $state('');
	let selectedSortLabel: string = $state('');
	let isSortDropdownOpen: boolean = $state(false);

	// Set initial selectedSort and selectedSortLabel from URL
	$effect(() => {
		const url = new URL(page.url);
		const sortValue = url.searchParams.get('sort_by');
		selectedSort = sortValue ?? '';
		const selected = SORT_OPTIONS.find((opt) => opt.value === sortValue);
		selectedSortLabel = selected ? selected.label : '';
	});

	function handleSortClick(value: string, label: string) {
		selectedSort = value;
		selectedSortLabel = label;
		isSortDropdownOpen = false;
		gotoProductsSearch();
	}

	function gotoProductsSearch() {
		goto('/products/search?q=' + encodeURIComponent(data.query) + '&sort_by=' + selectedSort);
	}

	function handleSortOptionSelect(value: string) {
		selectedSort = value;
		const selected = SORT_OPTIONS.find((opt) => opt.value === value);
		selectedSortLabel = selected ? selected.label : '';
		isSortDropdownOpen = false;
		gotoProductsSearch();
	}
</script>

<Metadata
	title={$_('search.title', { values: { query: data.query } })}
	description={$_('search.description', { values: { query: data.query } })}
/>

<!-- Sort By Dropdown -->
<div class="my-4 justify-end hidden lg:flex">
	<div class="dropdown dropdown-center lg:w-60 md:w-50">
		<button
			class="btn btn-outline btn-sm m-1 flex items-center gap-2 w-full justify-start text-xs lg:text-sm"
			onclick={() => (isSortDropdownOpen = !isSortDropdownOpen)}
		>
			Sort by
			{#if selectedSortLabel}
				: <span class="font-semibold md:max-w-20 lg:max-w-30 truncate inline-block align-middle" title={selectedSortLabel}>{selectedSortLabel}</span>
			{/if}
		</button>
		{#if isSortDropdownOpen}
			<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-full p-2 shadow">
				{#each SORT_OPTIONS as { label, value }}
					<li>
						<button class="w-full text-left" onclick={() => handleSortClick(value, label)}>
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
	isSortDropdownOpen={isSortDropdownOpen}
	onSortClick={() => (isSortDropdownOpen = !isSortDropdownOpen)}
	onSortOptionSelect={handleSortOptionSelect}
	selectedSort={selectedSort}
/>
