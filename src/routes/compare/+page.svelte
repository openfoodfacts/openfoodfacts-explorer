<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	import { KP_ATTRIBUTE_IMG } from '$lib/const';
	import { compareStore } from '$lib/stores/compareStore';

	function getNutriscoreImage(grade: string | null | undefined) {
		return KP_ATTRIBUTE_IMG('nutriscore-' + (grade ?? 'unknown') + '-new-en.svg');
	}

	function getNovaImage(group: string | number | null | undefined) {
		return group
			? KP_ATTRIBUTE_IMG('nova-group-' + group + '.svg')
			: KP_ATTRIBUTE_IMG('nova-group-unknown.svg');
	}

	function getEcoscoreImage(grade: string | null | undefined) {
		return KP_ATTRIBUTE_IMG('ecoscore-' + (grade ?? 'unknown') + '.svg');
	}

	// Helper to format nutrient values
	function formatNutrient(value: number | undefined | null, decimals = 1): string {
		if (value === undefined || value === null) {
			return '-';
		}
		// Show 0 decimals for energy
		if (decimals === 0) {
			return value.toFixed(0);
		}
		// Avoid showing .0 for whole numbers like 5.0g -> 5g
		return String(parseFloat(value.toFixed(decimals)));
	}
</script>

<svelte:head>
	<title>Compare Products</title>
	<meta name="description" content="Compare nutritional information of food products" />
</svelte:head>

<Card class="max-w-6xl mx-auto px-4">
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
		<div class="overflow-x-auto pb-4">
			<div class="flex flex-wrap justify-center gap-4">
				{#each $compareStore as product (product.code)}
					<div class="relative rounded-lg border p-2 shadow-md w-64 flex flex-col">
						<button
							class="absolute top-2 right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600 cursor-pointer z-10"
							onclick={() => compareStore.removeProduct(product.code)}
							aria-label="Remove product from comparison"
						>
							<span class="icon-[mdi--close] h-4 w-4 block"></span>
						</button>

						<div class="flex flex-col items-center pt-4">
							{#if product.image_front_small_url}
								<img
									src={product.image_front_small_url}
									alt={product.product_name ?? product.code}
									class="mb-2 h-24 object-contain"
								/>
							{/if}
							<h3 class="mt-2 text-center font-semibold">
								<a href={`/products/${product.code}`} class="link">
									{product.product_name ?? product.code}
								</a>
							</h3>
							<p class="mt-1 text-center text-sm text-gray-600">
								{product.brands ?? ''}
								{#if product.brands && product.quantity},{/if}
								{product.quantity ?? ''}
							</p>
						</div>

						{#if product.nutriscore_grade || product.nova_group || product.ecoscore_grade}
							<div class="mt-2 border-t pt-2">
								<p class="mb-1 text-sm font-semibold">Scores:</p>
								<div class="flex items-center justify-around gap-2">
									{#if product.nutriscore_grade}
										<div>
											<img
												src={getNutriscoreImage(product.nutriscore_grade)}
												alt="Nutri-Score {product.nutriscore_grade.toUpperCase()}"
												title="Nutri-Score {product.nutriscore_grade.toUpperCase()}"
												class="h-8"
											/>
										</div>
									{/if}
									{#if product.nova_group}
										<div>
											<img
												src={getNovaImage(product.nova_group)}
												alt="Nova Group {product.nova_group}"
												title="Nova Group {product.nova_group}"
												class="h-8"
											/>
										</div>
									{/if}
									{#if product.ecoscore_grade}
										<div>
											<img
												src={getEcoscoreImage(product.ecoscore_grade)}
												alt="Eco-Score {product.ecoscore_grade.toUpperCase()}"
												title="Eco-Score {product.ecoscore_grade.toUpperCase()}"
												class="h-8"
											/>
										</div>
									{/if}
								</div>
							</div>
						{/if}

						{#if product.nutriments}
							<div class="hidden md:block mt-2 border-t pt-2 text-xs">
								<p class="mb-1 text-sm font-semibold">Nutrients / 100g:</p>
								{#if product.nutriments['energy-kcal_100g'] !== undefined}
								<p><strong>Energy:</strong> {formatNutrient(product.nutriments['energy-kcal_100g'], 0)} kcal</p>
								{/if}
								{#if product.nutriments['fat_100g'] !== undefined}
								<p><strong>Fat:</strong> {formatNutrient(product.nutriments['fat_100g'])} {product.nutriments['fat_unit'] ?? 'g'}</p>
								{/if}
								{#if product.nutriments['saturated-fat_100g'] !== undefined}
								<p class="ml-2">Saturated: {formatNutrient(product.nutriments['saturated-fat_100g'])} {product.nutriments['saturated-fat_unit'] ?? 'g'}</p>
								{/if}
								{#if product.nutriments['sugars_100g'] !== undefined}
								<p><strong>Sugars:</strong> {formatNutrient(product.nutriments['sugars_100g'])} {product.nutriments['sugars_unit'] ?? 'g'}</p>
								{/if}
								{#if product.nutriments['salt_100g'] !== undefined}
								<p><strong>Salt:</strong> {formatNutrient(product.nutriments['salt_100g'], 2)} {product.nutriments['salt_unit'] ?? 'g'}</p>
								{/if}
							</div>
						{/if}

					</div>
				{/each}
			</div>
		</div>
	{/if}
</Card>