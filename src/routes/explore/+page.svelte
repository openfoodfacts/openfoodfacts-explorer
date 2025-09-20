<script lang="ts">
	import Logo from '$lib/ui/Logo.svelte';
	import SearchBar from '$lib/ui/SearchBar.svelte';
	import { _ } from '$lib/i18n';
	import type { PageProps } from './$types';
	import WcProductCard from '$lib/ui/WcProductCard.svelte';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();
	let searchQuery = $state('');

	function handleSearch(query: string) {
		goto(`/search?q=${encodeURIComponent(query)}`);
	}
</script>

<section class="bg-base-100 flex flex-col items-center justify-center px-4 py-12">
	<Logo />
	<h1 class="text-primary mb-2 text-center text-4xl font-bold drop-shadow-lg sm:text-5xl">
		{$_('explore.title')}
	</h1>
	<p class="text-secondary-content mb-6 max-w-2xl text-center text-lg">
		{$_('explore.subtitle')}
	</p>
	<div class="mb-8 flex w-full max-w-xl justify-center">
		<SearchBar bind:searchQuery onSearch={handleSearch} />
	</div>
</section>

<div class="mx-auto w-full max-w-7xl px-4 pb-16">
	{#if data.sections}
		{#each data.sections as section (section.category)}
			<section class="mb-12">
				<h2 class="text-primary mb-4 text-2xl font-bold">Most popular {section.category}</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each section.products as product (product.code)}
						<div>
							<div class="indicator indicator-center indicator-bottom w-full">
								<p class="indicator-item badge badge-info text-xs select-none">
									{product.scans_n} scans
								</p>
								<WcProductCard {product} />
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{:else}
		<div class="flex h-32 items-center justify-center">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{/if}
</div>
