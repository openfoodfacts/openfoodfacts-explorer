<script lang="ts">
	import { page } from '$app/stores';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let error = '';

	function getPageUrl(url: URL, p: number) {
		try {
			const newUrl = new URL(url.toString());
			newUrl.searchParams.set('page', p.toString());
			return newUrl.toString();
		} catch (err) {
			console.error('URL error:', err);
			const currentUrl = window.location.href;
			const baseUrl = currentUrl.split('?')[0];
			const params = new URLSearchParams(window.location.search);
			params.set('page', p.toString());
			return `${baseUrl}?${params.toString()}`;
		}
	}
  
	function getSortLabel(sortOption: string): string {
		const labels = {
			relevance: 'Relevance',
			nutrition_grade: 'Nutrition Score (A→E)',
			ecoscore: 'Eco Score (High→Low)'
		};
		return labels[sortOption] || sortOption;
	}
  
	function changeSort(newSortBy: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('sort_by', newSortBy);
		url.searchParams.set('page', '1');
		goto(url.toString());
	}

	onMount(() => {
		console.log('Data:', data);
	});
</script>

{#if error}
	<div class="alert alert-error mb-4">
		<span>{error}</span>
	</div>
{/if}

<div class="mb-4 text-sm opacity-70">
	<p>Query: {$page.url.searchParams.get('q')}</p>
	<p>Sort: {getSortLabel(data.sortBy)}</p>
</div>

{#await data.result}
	<p>Loading search results...</p>
	{#each Array(5) as i (i)}
		<div class="skeleton dark:bg-base-300 h-24 bg-white p-4 shadow-md"></div>
	{/each}
{:then result}
	<div class="mb-6 flex justify-end">
		<div class="dropdown dropdown-hover dropdown-end">
			<label tabindex="0" class="btn btn-sm m-1">
				Sort: {getSortLabel(data.sortBy)}
			</label>
			<ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
				{#each data.sortOptions as option}
					<li>
						<button 
							class="flex justify-between items-center {option === data.sortBy ? 'font-bold' : ''}" 
							on:click={() => changeSort(option)}
						>
							{getSortLabel(option)}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	{#if result && result.products && result.products.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each result.products as product}
				<SmallProductCard {product} />
			{/each}
		</div>

		<div class="join my-8 flex justify-center">
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

			{#if result.total_pages > result.page + 1}
				<a href={getPageUrl($page.url, result.page + 1)} class="btn join-item">{result.page + 1}</a>
			{/if}
			{#if result.total_pages > result.page + 2}
				<button class="btn btn-disabled join-item">...</button>
			{/if}
			{#if result.total_pages > result.page}
				<a href={getPageUrl($page.url, result.total_pages)} class="btn join-item">
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
{:catch err}
	<div class="alert alert-error">
		<p>Error loading search results: {err.message || 'Unknown error'}</p>
	</div>
{/await}
