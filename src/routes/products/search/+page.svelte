<script lang="ts">
	import { page } from '$app/state';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import { _ } from '$lib/i18n';
	import type { PageData } from './$types';
	import Pagination from '$lib/Pagination.svelte';
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';
	import Metadata from '$lib/Metadata.svelte';
	import FacetBar from '$lib/ui/FacetBar.svelte';

	type Props = { data: PageData };
	let { data }: Props = $props();

	$effect(() => {
		data.search.then((result) => {
			if (result.count == 0) $tracker.trackEvent('Product Search', 'No Results', data.query);
		});
	});

	let { search } = $derived(data);
</script>

<Metadata
	title={$_('search.title', { values: { query: data.query } })}
	description={$_('search.description', { values: { query: data.query } })}
/>

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
	<FacetBar facets={result.facets} />
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
