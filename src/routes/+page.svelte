<script lang="ts">
	import type { PageData } from './$types';

	import Card from '$lib/ui/Card.svelte';
	import Logo from '$lib/ui/Logo.svelte';
	import SmallProductCard from '$lib/ui/SmallProductCard.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<!-- Preconnect to static assets -->
	<link rel="preconnect" href="https://images.openfoodfacts.org" crossorigin="anonymous" />

	<title>Open Food Facts Explorer</title>
</svelte:head>

<div class="mx-auto my-4 flex flex-col items-center md:container xl:max-w-6xl">
	<Card>
		<div class="card-body items-center text-center">
			<h3 class="card-title mb-4 block text-2xl md:flex">
				Welcome to
				<div class="block xl:inline-block">
					<Logo />
				</div>
				Explorer!
			</h3>

			<p>
				<strong>OpenFoodFacts Explorer</strong>
				is a tool to explore the OpenFoodFacts database.
			</p>
			<p>
				You can enter a product code in the search bar above to get started or click on one of the
				products below.
			</p>
		</div>
	</Card>

	<div class="mt-8 w-full">
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			{#await data.streamed.products}
				{#each Array(4) as _}
					<div class="skeleton h-28 bg-white p-4 shadow-md dark:bg-base-300"></div>
				{/each}
			{:then products}
				{#each products as state}
					<SmallProductCard product={state.product} />
				{/each}
			{/await}
		</div>
	</div>
</div>
