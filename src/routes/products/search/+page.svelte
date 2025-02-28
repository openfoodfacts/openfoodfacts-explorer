<script lang="ts">
	import { page } from '$app/stores';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
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
	{#each Array(5) as _}
		<div class="skeleton dark:bg-base-300 h-24 bg-white p-4 shadow-md"></div>
	{/each}
{:then result}
	{#each result.products as product}
		<SmallProductCard {product} />
	{/each}

	<div class="join my-8 justify-center">
		{#if result.page > 1}
			<a href={getPageUrl($page.url, 1)} class="btn join-item"> 1 </a>
		{/if}
		{#if result.page > 3}
			<button class="btn btn-disabled join-item">...</button>
		{/if}

		{#if result.page > 2}
			<a href={getPageUrl($page.url, result.page - 1)} class="btn join-item">
				{result.page - 1}
			</a>
		{/if}

		<button class="btn join-item btn-active">{result.page}</button>

		{#if result.page_count > result.page + 1}
			<a href={getPageUrl($page.url, result.page + 1)} class="btn join-item">{result.page + 1}</a>
		{/if}
		{#if result.page_count > result.page + 2}
			<button class="btn btn-disabled join-item">...</button>
		{/if}
		{#if result.page_count > result.page}
			<a href={getPageUrl($page.url, result.page_count)} class="btn join-item">
				{result.page_count}
			</a>
		{/if}
	</div>
{/await}
