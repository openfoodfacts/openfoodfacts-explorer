<script lang="ts">
	import { t } from '$lib/translations';
	import {
		calculatorItems,
		isCalculatorOpen,
		updateItemQuantity,
		removeItem,
		clearCalculator,
		toggleCalculator
	} from '$lib/stores/calculatorStore';

	function calculateTotals() {
		let totals = {
			calories: 0,
			proteins: 0,
			carbohydrates: 0,
			fat: 0,
			sugars: 0,
			salt: 0
		};

		$calculatorItems.forEach((item) => {
			const factor = item.quantity / 100;
			totals.calories += (item.nutriments.calories || 0) * factor;
			totals.proteins += (item.nutriments.proteins || 0) * factor;
			totals.carbohydrates += (item.nutriments.carbohydrates || 0) * factor;
			totals.fat += (item.nutriments.fat || 0) * factor;

			if (item.nutriments.sugars) {
				totals.sugars += item.nutriments.sugars * factor;
			}

			if (item.nutriments.salt) {
				totals.salt += item.nutriments.salt * factor;
			}
		});

		return totals;
	}
</script>

<!-- Calculator button -->
<button class="btn btn-outline link" on:click={toggleCalculator} aria-label="Nutrition Calculator">
	<span class="icon-[mdi--calculator] mr-1 h-6 w-6"></span>
	{$t('calculator') || 'Calculator'}
</button>

<!-- Calculator panel -->
{#if $isCalculatorOpen}
	<div
		class="calculator-panel bg-base-100 fixed top-20 right-4 z-50 w-96 max-w-full rounded-lg p-4 shadow-lg"
	>
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-bold">Nutrition Calculator</h3>
			<button class="btn btn-sm btn-circle" on:click={toggleCalculator}>
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
							>
								<span class="icon-[mdi--minus] h-4 w-4"></span>
							</button>
							<button
								class="btn btn-sm btn-square ml-1"
								on:click={() => updateItemQuantity(item.id, 25)}
							>
								<span class="icon-[mdi--plus] h-4 w-4"></span>
							</button>
							<button class="btn btn-sm btn-square ml-1" on:click={() => removeItem(item.id)}>
								<span class="icon-[mdi--delete] h-4 w-4"></span>
							</button>
						</div>
					</div>
				{/each}
			</div>

			<!-- Total nutrition info -->
			{@const totals = calculateTotals()}
			<div class="bg-base-200 mt-4 rounded p-2">
				<h4 class="mb-2 font-bold">Total Nutrition:</h4>
				<div class="grid grid-cols-2 gap-2 text-sm">
					<div>Calories: {totals.calories.toFixed(1)} kcal</div>
					<div>Protein: {totals.proteins.toFixed(1)}g</div>
					<div>Carbs: {totals.carbohydrates.toFixed(1)}g</div>
					<div>Fat: {totals.fat.toFixed(1)}g</div>
					{#if totals.sugars > 0}
						<div>Sugars: {totals.sugars.toFixed(1)}g</div>
					{/if}
					{#if totals.salt > 0}
						<div>Salt: {totals.salt.toFixed(1)}g</div>
					{/if}
				</div>
			</div>

			<!-- Action buttons -->
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
