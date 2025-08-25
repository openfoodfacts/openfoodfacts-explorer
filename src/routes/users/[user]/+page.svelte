<script lang="ts">
	import WcProductCard from '$lib/ui/WcProductCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { contributor, editor, photographer, user } = $derived(data);
</script>

<h1 class="my-8 text-3xl font-bold">Contributor Dashboard - {user}</h1>

<!-- Open Prices Dashboard Button -->
<div class="mb-8">
	<a
		href="https://prices.openfoodfacts.org/dashboard"
		class="btn btn-primary btn-lg"
		target="_blank"
		rel="noopener noreferrer"
	>
		<span class="icon-[mdi--chart-line] mr-2"></span>
		Open Prices Dashboard
	</a>
</div>

<section class="mb-8">
	<h2 class="my-4 text-xl font-bold">Has Created</h2>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each contributor.products.slice(0, 6) as product (product.code)}
			<WcProductCard {product} />
		{/each}
	</div>

	<a href={`/facets/contributors/${user}`} class="btn btn-outline mt-4 w-full">
		View all contributions
	</a>
</section>

<section class="mb-8">
	<h2 class="my-4 text-xl font-bold">Has Edited</h2>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each editor.products.slice(0, 6) as product (product.code)}
			<product-card {product} class="h-[11rem] w-full"></product-card>
		{/each}
	</div>

	<a href={`/facets/editors/${user}`} class="btn btn-outline mt-4 w-full"> View all edits </a>
</section>

{#if photographer && photographer.products.length > 0}
	<section class="mb-8">
		<h2 class="my-4 text-xl font-bold">Has Photographed</h2>
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each photographer.products.slice(0, 6) as product (product.code)}
				<product-card {product} class="h-[11rem] w-full"></product-card>
			{/each}
		</div>

		<a href={`/facets/photographers/${user}`} class="btn btn-outline mt-4 w-full">
			View all photos
		</a>
	</section>
{/if}

<!-- Future sections placeholder -->
<section class="mb-8">
	<h2 class="my-4 text-xl font-bold">Future Enhancements</h2>
	<div class="card bg-base-200">
		<div class="card-body">
			<h3 class="card-title">Coming Soon</h3>
			<ul class="list-inside list-disc space-y-2">
				<li>📊 Contributor metrics and statistics</li>
				<li>🏷️ Personal tagline display</li>
				<li>🎮 Hunger Games promotional content</li>
			</ul>
		</div>
	</div>
</section>
