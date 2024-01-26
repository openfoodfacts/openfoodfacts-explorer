<script lang="ts">
	import type { PageData } from './$types';

	import { navigating } from '$app/stores';

	import Card from '$lib/ui/Card.svelte';
	import Logo from '$lib/ui/Logo.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<!-- Preconnect to static assets -->
	<link rel="preconnect" href="https://images.openfoodfacts.org" crossorigin="anonymous" />
</svelte:head>

<div class="container mx-auto my-4 flex flex-col items-center xl:max-w-6xl">
	<Card>
		<div class="card-body items-center text-center">
			<h3 class="card-title mb-4 text-2xl">
				Welcome to
				<Logo />
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
		{#await data.streamed.products}
			<div class="mt-10 flex justify-center">
				<span class="loading loading-dots loading-lg mx-auto" />
			</div>
		{:then products}
			<div class="grid grid-cols-4 gap-4">
				{#each products as state}
					<a
						href={`/products/${state.product.code}`}
						class="btn btn-ghost pointer-events-none h-auto justify-normal bg-white p-4 text-start text-primary shadow-md dark:bg-base-300"
						class:pointer-events-none={$navigating}
					>
						<div class="flex flex-row items-center">
							<div class="mr-4 flex w-16 flex-shrink-0 items-center justify-center">
								{#if $navigating?.to?.params?.barcode === state.product.code}
									<span class="loading loading-ring loading-lg mx-auto my-auto" />
								{:else if state.product.image_front_small_url}
									<img
										src={state.product.image_front_small_url}
										class="h-16 rounded-lg object-cover"
										alt="Product front"
									/>
								{/if}
							</div>
							<div>
								<p class="text-lg">
									{state.product.product_name ?? state.product.code}
								</p>
								<p class="mt-2 text-sm font-light">
									{state.product.brands} - {state.product.quantity}
								</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/await}
	</div>
</div>
