<script lang="ts">
	import { t } from '$lib/translations';
	import {
		calculatorItems,
		isCalculatorOpen,
		updateItemQuantity,
		removeItem,
		clearCalculator,
		toggleCalculator,
		totalNutrition
	} from '$lib/stores/calculatorStore';
	import { onMount } from 'svelte';

	onMount(() => {
		calculatorItems.update((items) => [...items]);
	});
</script>

<div class="fixed right-6 bottom-6 z-50">
	<button
		class="btn btn-circle btn-primary shadow-lg"
		on:click={toggleCalculator}
		aria-label="Nutrition Calculator"
	>
		<span class="icon-[mdi--calculator] h-6 w-6"></span>
		{#if $calculatorItems.length > 0}
			<span
				class="bg-secondary absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
			>
				{$calculatorItems.length}
			</span>
		{/if}
	</button>
</div>

{#if $isCalculatorOpen}
	<div
		class="calculator-panel bg-base-100 fixed top-20 right-4 z-50 w-96 max-w-full rounded-lg p-4 shadow-lg"
	>
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-bold">Nutrition Calculator</h3>
			<button
				class="btn btn-sm btn-circle"
				on:click={toggleCalculator}
				aria-label="Close calculator"
			>
				<span class="icon-[mdi--close] h-5 w-5"></span>
			</button>
		</div>

		{#if $calculatorItems.length === 0}
			<div class="py-6 text-center">
				<p>Add products to calculate total nutrition</p>
			</div>
		{:else}
			<div class="max-h-80 overflow-y-auto">
				{#each $calculatorItems as item}
					<div class="flex items-center justify-between border-b p-2">
						<div class="flex items-center">
							{#if item.imageUrl}
								<img
									src={item.imageUrl}
									alt={item.name}
									class="mr-2 h-12 w-12 rounded object-cover"
								/>
							{/if}
							<div>
								<p class="font-medium">{item.name}</p>
								<p class="text-xs">{item.quantity}g</p>
							</div>
						</div>
						<div class="flex items-center">
							<button
								class="btn btn-sm btn-square"
								on:click={() => updateItemQuantity(item.id, -25)}
								aria-label="Decrease quantity"
							>
								<span class="icon-[mdi--minus] h-4 w-4"></span>
							</button>
							<button
								class="btn btn-sm btn-square ml-1"
								on:click={() => updateItemQuantity(item.id, 25)}
								aria-label="Increase quantity"
							>
								<span class="icon-[mdi--plus] h-4 w-4"></span>
							</button>
							<button
								class="btn btn-sm btn-square ml-1"
								on:click={() => removeItem(item.id)}
								aria-label="Remove item"
							>
								<span class="icon-[mdi--delete] h-4 w-4"></span>
							</button>
						</div>
					</div>
				{/each}
			</div>

			<div class="bg-base-200 mt-4 rounded p-2">
				<h4 class="mb-2 font-bold">Total Nutrition:</h4>
				<div class="grid grid-cols-2 gap-2 text-sm">
					<div>Calories: {$totalNutrition.calories.toFixed(1)} kcal</div>
					<div>Protein: {$totalNutrition.proteins.toFixed(1)}g</div>
					<div>Carbs: {$totalNutrition.carbohydrates.toFixed(1)}g</div>
					<div>Fat: {$totalNutrition.fat.toFixed(1)}g</div>
					{#if $totalNutrition.sugars > 0}
						<div>Sugars: {$totalNutrition.sugars.toFixed(1)}g</div>
					{/if}
					{#if $totalNutrition.salt > 0}
						<div>Salt: {$totalNutrition.salt.toFixed(1)}g</div>
					{/if}
				</div>
			</div>

			<div class="mt-4 flex justify-end">
				<button class="btn btn-sm btn-error" on:click={clearCalculator}> Clear All </button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.calculator-panel {
		transition: all 0.3s ease;
	}
</style>
