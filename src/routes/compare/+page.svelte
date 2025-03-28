<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/ui/Card.svelte';
	import { KP_ATTRIBUTE_IMG } from '$lib/const';
	import { compareStore } from '$lib/stores/compareStore';

	let isMobile = $state(false);

	function handleResize() {
		isMobile = window.innerWidth < 768;
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function getNutriscoreImage(grade) {
		return KP_ATTRIBUTE_IMG('nutriscore-' + grade + '-new-en.svg');
	}

	function getNovaImage(group) {
		return group
			? KP_ATTRIBUTE_IMG('nova-group-' + group + '.svg')
			: KP_ATTRIBUTE_IMG('nova-group-unknown.svg');
	}

	function getEcoscoreImage(grade) {
		return KP_ATTRIBUTE_IMG('ecoscore-' + grade + '.svg');
	}
</script>

<svelte:head>
	<title>Compare Products | Open Food Facts</title>
</svelte:head>

<Card>
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Compare Products</h1>
		{#if $compareStore.length > 0}
			<button class="btn btn-sm btn-outline" onclick={() => compareStore.clear()}>
				Clear All
			</button>
		{/if}
	</div>

	{#if $compareStore.length === 0}
		<div class="py-8 text-center">
			<p class="mb-4 text-lg">No products selected for comparison</p>
			<a href="/products/search?q=chocolate" class="btn btn-primary">Browse Products</a>
		</div>
	{:else}
		<div class={isMobile ? 'overflow-x-auto pb-4' : ''}>
			<div
				class={isMobile ? 'w-max' : ''}
				style={isMobile
					? ''
					: `display: grid; grid-template-columns: repeat(${$compareStore.length}, 1fr); gap: 1rem;`}
			>
				{#each $compareStore as product, i}
					<div class="relative rounded-lg border p-2">
						<button
							class="btn btn-circle btn-xs btn-ghost absolute top-2 right-2"
							onclick={() => compareStore.removeProduct(product.code)}
						>
							<span class="icon-[mdi--close] h-3 w-3"></span>
						</button>

						<div class="mb-4 flex flex-col items-center pt-4">
							{#if product.image_front_small_url}
								<img
									src={product.image_front_small_url}
									alt={product.product_name}
									class="mb-2 h-24 object-contain"
								/>
							{/if}
							<h3 class="mt-2 text-center font-semibold">
								<a href={`/products/${product.code}`} class="link">
									{product.product_name ?? product.code}
								</a>
							</h3>
							<p class="mt-1 text-center text-sm">{product.brands} - {product.quantity}</p>
						</div>

						{#if product.product_type === 'food'}
							<div class="mt-2 border-t pt-2">
								<p class="mb-1 text-sm font-semibold">Nutrition Scores:</p>
								<div class="flex items-center justify-around gap-2">
									<div>
										<img
											src={getNutriscoreImage(product.nutriscore_grade)}
											alt="nutriscore"
											class="h-6"
										/>
									</div>
									<div><img src={getNovaImage(product.nova_group)} alt="nova" class="h-6" /></div>
									<div>
										<img
											src={getEcoscoreImage(product.ecoscore_grade)}
											alt="ecoscore"
											class="h-6"
										/>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</Card>
