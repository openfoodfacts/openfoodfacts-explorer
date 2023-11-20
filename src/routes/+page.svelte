<script lang="ts">
	import { navigating } from '$app/stores';
	import Card from '$lib/ui/Card.svelte';
	import Logo from '$lib/ui/Logo.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container xl:max-w-6xl mx-auto my-4 flex flex-col items-center">
	<Card>
		<div class="card-body items-center text-center">
			<h3 class="card-title text-2xl mb-4">
				Welcome to
				<Logo />
				Explorer!
			</h3>

			<p>OpenFoodFacts Explorer is a tool to explore the OpenFoodFacts database.</p>
			<p>
				You can enter a product code in the search bar above to get started or click on one of the
				products below.
			</p>
		</div>
	</Card>

	<div class="mt-8 w-full">
		{#await data.streamed.products}
			<div class="justify-center flex">
				<span class="loading loading-ring loading-lg mx-auto" />
			</div>
		{:then products}
			<div class="grid grid-cols-4 gap-4">
				{#each products as state}
					<a
						href={`/products/${state.product.code}`}
						class="btn btn-ghost h-auto p-2 justify-normal text-start pointer-events-none"
						class:pointer-events-none={$navigating}
					>
						<div class="flex flex-row items-center">
							<div class="mr-4 w-16 flex-shrink-0 flex justify-center items-center">
								{#if $navigating?.to?.params?.barcode === state.product.code}
									<span class="loading loading-ring loading-lg mx-auto my-auto" />
								{:else if state.product.image_front_small_url}
									<img
										src={state.product.image_front_small_url}
										class="h-16 object-cover rounded-lg"
										alt="Product front"
									/>
								{/if}
							</div>
							<p>
								{state.product.product_name ?? state.product.code}
							</p>
						</div>
					</a>
				{/each}
			</div>
		{/await}
	</div>
</div>
