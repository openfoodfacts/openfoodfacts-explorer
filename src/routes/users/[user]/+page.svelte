<script lang="ts">
	import WcProductCard from '$lib/ui/WcProductCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { contributor, editor, user } = $derived(data);
</script>

<h1 class="my-8 text-3xl font-bold">User profile of {user}</h1>

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
			<product-card {product} class="h-full w-full"></product-card>
		{/each}
	</div>

	<a href={`/facets/editors/${user}`} class="btn btn-outline mt-4 w-full"> View all edits </a>
</section>
