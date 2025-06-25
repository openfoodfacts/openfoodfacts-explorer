<script lang="ts">
	import { page } from '$app/state';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import { _ } from '$lib/i18n';
	import type { PageData } from './$types';
	import Pagination from '$lib/Pagination.svelte';
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';
	import Metadata from '$lib/Metadata.svelte';
	import { goto } from '$app/navigation';

	type Props = { data: PageData };
	let { data }: Props = $props();

	$effect(() => {
		data.search.then((result) => {
			if (result.count == 0) $tracker.trackEvent('Product Search', 'No Results', data.query);
		});
	});

	let { search } = $derived(data);

	const sortOptions = [
		{ label: 'Most scanned products', value: '-unique_scans_n' },
		{ label: 'Products with the best Eco-Score', value: 'ecoscore_grade' },
		{ label: 'Products with the best Nutri-Score', value: 'nutriscore_grade' },
		{ label: 'Recently added products', value: '-created_t' },
		{ label: 'Recently modified products', value: '-last_modified_t' }
	];

	let selectedSort: string = $state('');
	let selectedSortLabel: string = $state('');
	let isSortDropdownOpen: boolean = $state(false);

	function handleSortClick(value: string, label: string) {
		selectedSort = value;
		selectedSortLabel = label;
		isSortDropdownOpen = false;
		console.log(`Sorting by: ${value}`);
		gotoProductsSearch();
	}

	function gotoProductsSearch() {
		console.log('Going to products search with query:', data.query, 'and sort:', selectedSort);
		goto('/products/search?q=' + encodeURIComponent(data.query) + '&sort_by=' + selectedSort);
	}
</script>

<Metadata
	title={$_('search.title', { values: { query: data.query } })}
	description={$_('search.description', { values: { query: data.query } })}
/>

<!-- Sort By Dropdown -->
<div class="mb-4 flex justify-end">
	<div class="dropdown dropdown-end">
		<button
			class="btn btn-outline btn-sm m-1 flex items-center gap-2"
			onclick={() => (isSortDropdownOpen = !isSortDropdownOpen)}
		>
			{selectedSortLabel || 'Sort by'}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 9l-7 7-7-7"
				/></svg
			>
		</button>
		{#if isSortDropdownOpen}
			<ul class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
				{#each sortOptions as { label, value }}
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
