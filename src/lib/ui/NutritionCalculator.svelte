<script lang="ts">
	import {
		calculatorItems,
		isCalculatorOpen,
		updateItemQuantity,
		removeItem,
		clearCalculator,
		toggleCalculator,
		totalNutrition
	} from '#lib/stores/calculatorStore.js';
	import { onMount } from 'svelte';
	import { _ } from '#lib/i18n/index.js';

	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiMinus from '@iconify-svelte/mdi/minus';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiDelete from '@iconify-svelte/mdi/delete';

	onMount(() => {
		calculatorItems.update((items) => [...items]);
	});
</script>

{#if $isCalculatorOpen}
	<div
		class="calculator-panel fixed top-20 right-4 z-50 w-96 max-w-full rounded-lg bg-base-100 p-4 shadow-lg"
	>
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-bold">
				{$_('calculator.title', { default: 'Nutrition Calculator' })}
			</h3>
			<button
				class="btn btn-circle btn-sm"
				onclick={toggleCalculator}
				aria-label={$_('calculator.close_aria', { default: 'Close calculator' })}
			>
				<IconMdiClose class="h-5 w-5" />
			</button>
		</div>

		{#if $calculatorItems.length === 0}
			<div class="py-6 text-center">
				<p>
					{$_('calculator.empty_state', { default: 'Add products to calculate total nutrition' })}
				</p>
			</div>
		{:else}
			<div class="max-h-80 overflow-y-auto">
				{#each $calculatorItems as item (item.id)}
					<div class="flex items-center justify-between border-b p-2">
						<div class="flex items-center">
							{#if item.imageUrl}
								<img
									src={item.imageUrl}
									loading="lazy"
									alt={item.name}
									class="mr-2 h-12 w-12 rounded object-cover"
								/>
							{/if}
							<div>
								<p class="font-medium">{item.name}</p>
								<p class="text-xs">
									{$_('calculator.quantity_grams', {
										values: { quantity: item.quantity },
										default: `${item.quantity}g`
									})}
								</p>
							</div>
						</div>
						<div class="flex items-center">
							<button
								class="btn btn-square btn-sm"
								onclick={() => updateItemQuantity(item.id, -25)}
								aria-label={$_('calculator.decrease_quantity_aria', {
									default: 'Decrease quantity'
								})}
							>
								<IconMdiMinus class="h-4 w-4" />
							</button>
							<button
								class="btn ml-1 btn-square btn-sm"
								onclick={() => updateItemQuantity(item.id, 25)}
								aria-label={$_('calculator.increase_quantity_aria', {
									default: 'Increase quantity'
								})}
							>
								<IconMdiPlus class="h-4 w-4" />
							</button>
							<button
								class="btn ml-1 btn-square btn-sm"
								onclick={() => removeItem(item.id)}
								aria-label={$_('calculator.remove_item_aria', {
									default: 'Remove item'
								})}
							>
								<IconMdiDelete class="h-4 w-4" />
							</button>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-4 rounded bg-base-200 p-2">
				<h4 class="mb-2 font-bold">
					{$_('calculator.total_nutrition', { default: 'Total Nutrition:' })}
				</h4>
				<div class="grid grid-cols-2 gap-2 text-sm">
					<div>
						{$_('calculator.calories', {
							values: { value: $totalNutrition.calories.toFixed(1) },
							default: `Calories: ${$totalNutrition.calories.toFixed(1)} kcal`
						})}
					</div>
					<div>
						{$_('calculator.proteins', {
							values: { value: $totalNutrition.proteins.toFixed(1) },
							default: `Protein: ${$totalNutrition.proteins.toFixed(1)}g`
						})}
					</div>
					<div>
						{$_('calculator.carbohydrates', {
							values: { value: $totalNutrition.carbohydrates.toFixed(1) },
							default: `Carbs: ${$totalNutrition.carbohydrates.toFixed(1)}g`
						})}
					</div>
					<div>
						{$_('calculator.fat', {
							values: { value: $totalNutrition.fat.toFixed(1) },
							default: `Fat: ${$totalNutrition.fat.toFixed(1)}g`
						})}
					</div>
					{#if $totalNutrition.sugars > 0}
						<div>
							{$_('calculator.sugars', {
								values: { value: $totalNutrition.sugars.toFixed(1) },
								default: `Sugars: ${$totalNutrition.sugars.toFixed(1)}g`
							})}
						</div>
					{/if}
					{#if $totalNutrition.salt > 0}
						<div>
							{$_('calculator.salt', {
								values: { value: $totalNutrition.salt.toFixed(1) },
								default: `Salt: ${$totalNutrition.salt.toFixed(1)}g`
							})}
						</div>
					{/if}
				</div>
			</div>

			<div class="mt-4 flex justify-end">
				<button
					class="btn btn-error btn-sm"
					onclick={clearCalculator}
					aria-label={$_('calculator.clear_all_aria', {
						default: 'Clear all items from calculator'
					})}
				>
					{$_('calculator.clear_all', { default: 'Clear All' })}
				</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.calculator-panel {
		transition: all 0.3s ease;
	}
</style>
