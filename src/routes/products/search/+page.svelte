<script lang="ts">
	import { page } from '$app/state';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import { _ } from '$lib/i18n';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function getPageUrl(url: URL, p: number) {
		url.searchParams.set('page', p.toString());
		return url.toString();
	}
</script>

{#await data.result}
	<div
		class="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-3"
	>
		{#each Array(5) as _, i (i)}
			<div class="skeleton dark:bg-base-300 h-24 bg-white p-4 shadow-md"></div>
		{/each}
	</div>
{:then result}
	{#if result.count > 0}
		<div
			class="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2 xl:grid-cols-3"
		>
			{#each result.products as product (product.code)}
				<SmallProductCard {product} />
			{/each}
		</div>
	{:else}
		<div class="mt-8 grid w-full grid-cols-1 gap-4 lg:gap-2">
			<div class="mt-8 text-center">
				<p>{$_('product.search.product_not_found')}</p>
				<p>{$_('product.search.product_not_found_desc')}</p>
				<a
					class="btn btn-secondary join-item mt-5 px-10"
					href="/products/{page.url.searchParams.get('q')}/edit"
				>
					{$_('product.search.add_product')}
				</a>
			</div>
		</div>
	{/if}
{/await}

{#await data.result then result}
	<div class="join my-8 w-full justify-center">
		{#if result.page > 1}
			<a href={getPageUrl(page.url, 1)} class="btn join-item"> 1 </a>
		{/if}
		{#if result.page > 3}
			<button class="btn btn-disabled join-item">...</button>
		{/if}

		{#if result.page > 2}
			<a href={getPageUrl(page.url, result.page - 1)} class="btn join-item">
				{result.page - 1}
			</a>
		{/if}

		<button class="btn join-item btn-active">{result.page}</button>

		{#if result.total_pages > result.page + 1}
			<a href={getPageUrl(page.url, result.page + 1)} class="btn join-item">{result.page + 1}</a>
		{/if}
		{#if result.total_pages > result.page + 2}
			<button class="btn btn-disabled join-item">...</button>
		{/if}
		{#if result.total_pages > result.page}
			<a href={getPageUrl(page.url, result.total_pages)} class="btn join-item">
				{result.total_pages}
			</a>
		{/if}
	</div>
{/await}
