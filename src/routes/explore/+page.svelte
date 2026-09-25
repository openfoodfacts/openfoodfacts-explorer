<script lang="ts">
	import Logo from '$lib/ui/Logo.svelte';
	import Metadata from '$lib/Metadata.svelte';
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

<Metadata
	title={$_('explore.title', { default: 'Explore Open Food Facts' })}
	description={$_('explore.subtitle', {
		default: 'Discover trending products, popular categories, and contribute to food transparency!'
	})}
/>

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
	{#if data.hasSearchError}
		<div class="mb-8 alert alert-warning" role="alert" aria-live="polite">
			<span>
				{$_('explore.search_unavailable', {
					default: 'Some products could not be loaded. Please try again shortly.'
				})}
			</span>
		</div>
	{/if}

	{#if data.sections.length > 0}
		{#each data.sections as section (section.category)}
			<section class="mb-12">
				<h2 class="mb-4 text-2xl font-bold text-primary">Most popular {section.category}</h2>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each section.products as product (product.code)}
						<WcProductCard {product} scanCount={product.scans_n} />
					{/each}
				</div>
			</section>
		{/each}
	{:else if !data.hasSearchError}
		<div class="alert alert-info" role="status">
			<span
				>{$_('explore.no_products', { default: 'No products are available to explore yet.' })}</span
			>
		</div>
	{/if}
</div>
