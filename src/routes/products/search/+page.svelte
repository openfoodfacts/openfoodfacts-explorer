<script lang="ts">
	import { page } from '$app/state';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import { _ } from '$lib/i18n';
	import type { PageData } from './$types';
	import Pagination from '$lib/Pagination.svelte';

	type Props = { data: PageData };
	let { data }: Props = $props();

	let { search } = $derived(data);
</script>

<svelte:head>
	<title>{$_('product.search.title')} - {data.query} - Open Food Facts Explorer</title>
</svelte:head>

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
			<p class="mb-4 text-3xl font-bold">{$_('product.search.product_not_found')}</p>
			<p>{$_('product.search.product_not_found_desc')}</p>
		</div>
	{/if}
{/await}
