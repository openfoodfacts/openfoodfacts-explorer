<script lang="ts">
	import { page } from '$app/state';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import type { PageData } from './$types';
	import type { Product, ProductState, ProductStateFound } from '$lib/api/product';

	type ProductSearchResult = {
		count: number;
		page: number;
		page_size: number;
		page_count: number;
		products: ProductStateFound<Product>[];
		total_pages: number;
	};

	function isSuccessState(state: ProductStateFound<Product>): state is ProductStateFound<Product> {
		return state.status === 'success' || state.status === 'success_with_warnings';
	}

	interface Props {
		data: PageData & {
			result: Promise<ProductSearchResult>;
		};
	}

	let { data }: Props = $props();

	function getPageUrl(url: URL, p: number) {
		url.searchParams.set('page', p.toString());
		return url.toString();
	}
</script>

{#await data.result}
	{#each Array(5) as i (i)}
		<div class="skeleton dark:bg-base-300 h-24 bg-white p-4 shadow-md"></div>
	{/each}
{:then result}
	{#if result.count > 0}
		{#each result.products as state}
			{#if isSuccessState(state)}
				<SmallProductCard product={state.product} />
			{/if}
		{/each}

		<div class="join my-8 justify-center">
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
	{:else}
		<div class="mt-8 text-center opacity-70">
			<p>No products found</p>
			<p>We couldn't find any products matching your search</p>
		</div>
	{/if}
{/await}