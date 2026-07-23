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

<section class="flex flex-col items-center justify-center bg-base-100 px-4 py-12">
	<Logo />
	<h1 class="mb-2 text-center text-4xl font-bold text-primary drop-shadow-lg sm:text-5xl">
		{$_('explore.title')}
	</h1>
	<p class="mb-6 max-w-2xl text-center text-lg text-primary">
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
				<h2 class="mb-4 text-2xl font-bold text-primary">Most popular {section.category}</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each section.products as product (product.code)}
						<div>
							<div class="indicator w-full indicator-center indicator-bottom">
								<p class="indicator-item badge text-xs badge-info select-none">
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
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{/if}
</div>
