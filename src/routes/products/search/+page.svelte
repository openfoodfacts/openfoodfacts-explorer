<script lang="ts">
	import { page } from '$app/state';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';
	import type { PageData } from './$types';

	const labels = {
		relevance: 'Relevance',
		nutrition_grade: 'Nutrition Score (A→E)',
		ecoscore: 'Eco Score (High→Low)'
	};

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function getPageUrl(url: URL, p: number) {
		url.searchParams.set('page', p.toString());
		return url.toString();
	}

	function getSortLabel(sortOption: string): string {
		return labels[sortOption] || sortOption;
	}

	function changeSort(newSortBy: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('sort_by', newSortBy);
		return url.toString();
	}
</script>

<div class="mb-4 flex justify-end">
	<div class="dropdown dropdown-end">
		<label tabindex="0" class="btn btn-sm m-1">
			Sort: {getSortLabel(data.sortBy)}
		</label>
		<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
			{#each data.sortOptions as option}
				<li>
					<a href={changeSort(option)} class={option === data.sortBy ? 'font-bold' : ''}>
						{getSortLabel(option)}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

{#await data.result}
	{#each Array(5) as i (i)}
		<div class="skeleton dark:bg-base-300 h-24 bg-white p-4 shadow-md"></div>
	{/each}
{:then result}
	{#if result.count > 0}
		{#each result.products as product}
			<SmallProductCard {product} />
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
