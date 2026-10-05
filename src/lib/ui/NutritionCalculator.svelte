<script lang="ts">
	import {
		calculatorItems,
		isCalculatorOpen,
		updateItemQuantity,
		removeItem,
		clearCalculator,
		toggleCalculator,
		totalNutrition
	} from '$lib/stores/calculatorStore';
	import { _ } from '$lib/i18n';

	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiMinus from '@iconify-svelte/mdi/minus';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiDelete from '@iconify-svelte/mdi/delete';
	import IconMdiAlertCircleOutline from '@iconify-svelte/mdi/alert-circle-outline';

	const QUANTITY_STEP = 25;
</script>

{#if $isCalculatorOpen}
	<div
		class="calculator-panel fixed top-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-lg bg-base-100 p-4 shadow-lg"
		role="dialog"
		aria-labelledby="nutrition-calculator-title"
	>
		<div class="mb-4 flex items-center justify-between">
			<h3 id="nutrition-calculator-title" class="text-lg font-bold">
				{$_('calculator.panel_title', { default: 'Nutrition Calculator' })}
			</h3>
			<button
				class="btn btn-circle btn-sm"
				onclick={toggleCalculator}
				aria-label={$_('calculator.close', { default: 'Close calculator' })}
			>
				<IconMdiClose class="h-5 w-5" aria-hidden="true" />
			</button>
		</div>

		{#if $calculatorItems.length === 0}
			<div class="py-6 text-center">
				<p>
					{$_('calculator.empty', { default: 'Add products to calculate total nutrition' })}
				</p>
			</div>
		{:else}
			<div class="max-h-80 overflow-y-auto">
				{#each $calculatorItems as item (item.id)}
					<div class="flex items-center justify-between gap-2 border-b border-base-300 p-2">
						<div class="flex min-w-0 items-center">
							{#if item.imageUrl}
								<img
									src={item.imageUrl}
									alt={item.name}
									class="mr-2 h-12 w-12 shrink-0 rounded object-cover"
								/>
							{/if}
							<div class="min-w-0">
								<p class="truncate font-medium">{item.name}</p>
								<p class="text-xs">
									{$_('calculator.quantity_grams', {
										default: '{quantity} g',
										values: { quantity: item.quantity }
									})}
								</p>
								{#if item.missingNutrition}
									<p class="flex items-center gap-1 text-xs text-warning">
										<IconMdiAlertCircleOutline class="h-4 w-4 shrink-0" aria-hidden="true" />
										{$_('calculator.missing_nutrition', {
											default: 'No nutrition data for this product'
										})}
									</p>
								{/if}
							</div>
						</div>
						<div class="flex shrink-0 items-center">
							<button
								class="btn btn-square btn-sm"
								onclick={() => updateItemQuantity(item.id, -QUANTITY_STEP)}
								aria-label={$_('calculator.decrease_quantity', {
									default: 'Decrease quantity of {name}',
									values: { name: item.name }
								})}
							>
								<IconMdiMinus class="h-4 w-4" aria-hidden="true" />
							</button>
							<button
								class="btn ml-1 btn-square btn-sm"
								onclick={() => updateItemQuantity(item.id, QUANTITY_STEP)}
								aria-label={$_('calculator.increase_quantity', {
									default: 'Increase quantity of {name}',
									values: { name: item.name }
								})}
							>
								<IconMdiPlus class="h-4 w-4" aria-hidden="true" />
							</button>
							<button
								class="btn ml-1 btn-square btn-sm"
								onclick={() => removeItem(item.id)}
								aria-label={$_('calculator.remove_item', {
									default: 'Remove {name}',
									values: { name: item.name }
								})}
							>
								<IconMdiDelete class="h-4 w-4" aria-hidden="true" />
							</button>
						</div>
					</div>
				{/each}
			</div>

			<div class="mt-4 rounded bg-base-200 p-2">
				<h4 class="mb-2 font-bold">
					{$_('calculator.total_nutrition', { default: 'Total nutrition' })}
				</h4>
				<div class="grid grid-cols-2 gap-2 text-sm">
					<div>
						{$_('calculator.calories', {
							default: 'Calories: {value} kcal',
							values: { value: $totalNutrition.calories.toFixed(1) }
						})}
					</div>
					<div>
						{$_('calculator.proteins', {
							default: 'Protein: {value} g',
							values: { value: $totalNutrition.proteins.toFixed(1) }
						})}
					</div>
					<div>
						{$_('calculator.carbohydrates', {
							default: 'Carbs: {value} g',
							values: { value: $totalNutrition.carbohydrates.toFixed(1) }
						})}
					</div>
					<div>
						{$_('calculator.fat', {
							default: 'Fat: {value} g',
							values: { value: $totalNutrition.fat.toFixed(1) }
						})}
					</div>
					{#if $totalNutrition.sugars > 0}
						<div>
							{$_('calculator.sugars', {
								default: 'Sugars: {value} g',
								values: { value: $totalNutrition.sugars.toFixed(1) }
							})}
						</div>
					{/if}
					{#if $totalNutrition.salt > 0}
						<div>
							{$_('calculator.salt', {
								default: 'Salt: {value} g',
								values: { value: $totalNutrition.salt.toFixed(1) }
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
