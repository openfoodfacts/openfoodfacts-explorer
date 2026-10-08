<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';

	import { isCosmeticProduct } from '$lib/flavor';
	import IngredientsStep from './IngredientsStep.svelte';
	import NutritionStep from './NutritionStep.svelte';
	import PackagingStep from './PackagingStep.svelte';

	type Props = {
		product: Product;
		units: string[];
		getIngredientsImage: (language: string) => string | null;
		getNutritionImage: (language: string) => string | null;
		getPackagingImage: (language: string) => string | null;
		handleNutrimentInput: (e: Event, key: string) => void;
		allergenNames?: string[];
	};

	let {
		product = $bindable(),
		units,
		getIngredientsImage,
		getNutritionImage,
		getPackagingImage,
		handleNutrimentInput,
		allergenNames = []
	}: Props = $props();

	let isCosmetic = $derived(isCosmeticProduct(product.product_type));
</script>

<div class="space-y-6">
	<div class="alert text-sm alert-info sm:text-base">
		<div>
			<p class="font-semibold">{$_('product.edit.sections.score_calculation')}</p>
			<p class="mt-1 text-xs sm:text-sm">{$_('product.edit.score_calculation_description')}</p>
			<p class="mt-1 text-xs opacity-70">{$_('product.edit.skip_score_info')}</p>
		</div>
	</div>

	<!-- Accordion container for ingredients, nutrition, and packaging -->
	<div class="space-y-4">
		<!-- Ingredients (Open by default) -->
		<div class="collapse-arrow collapse rounded-lg border border-base-300 bg-base-200">
			<input
				type="checkbox"
				checked
				aria-label={$_('product.edit.sections.ingredients', { default: 'Ingredients' })}
			/>
			<div class="collapse-title text-sm font-bold sm:text-base">
				{$_('product.edit.sections.ingredients')}
			</div>
			<div class="collapse-content bg-base-100">
				<div class="pt-5">
					<IngredientsStep bind:product {getIngredientsImage} {allergenNames} editMode={true} />
				</div>
			</div>
		</div>

		<!-- Nutrition Facts -->
		{#if isCosmetic}
			<div class="rounded-lg border border-base-300 bg-base-200/60 p-4 opacity-75">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-2">
						<span class="text-sm font-bold opacity-60 sm:text-base">
							{$_('product.edit.sections.nutrition', { default: 'Nutrition Facts' })}
						</span>
						<span class="badge badge-ghost badge-sm">
							{$_('product.edit.nutrition_disabled_cosmetics_badge', {
								default: 'Not applicable for cosmetics'
							})}
						</span>
					</div>
				</div>
				<p class="mt-1 text-xs text-base-content/60">
					{$_('product.edit.nutrition_disabled_cosmetics_help', {
						default:
							'Nutritional information is disabled because this product is classified as a cosmetic/beauty product.'
					})}
				</p>
			</div>
		{:else}
			<div class="collapse-arrow collapse rounded-lg border border-base-300 bg-base-200">
				<input
					type="checkbox"
					aria-label={$_('product.edit.sections.nutrition', { default: 'Nutrition Facts' })}
				/>
				<div class="collapse-title text-sm font-bold sm:text-base">
					{$_('product.edit.sections.nutrition')}
				</div>
				<div class="collapse-content bg-base-100">
					<div class="pt-5">
						<NutritionStep
							bind:product
							{units}
							{getNutritionImage}
							{handleNutrimentInput}
							editMode={true}
						/>
					</div>
				</div>
			</div>
		{/if}

		<!-- Packaging -->
		<div class="collapse-arrow collapse rounded-lg border border-base-300 bg-base-200">
			<input
				type="checkbox"
				aria-label={$_('product.edit.sections.packaging', { default: 'Packaging' })}
			/>
			<div class="collapse-title text-sm font-bold sm:text-base">
				{$_('product.edit.sections.packaging')}
			</div>
			<div class="collapse-content bg-base-100">
				<div class="pt-5">
					<PackagingStep bind:product {getPackagingImage} editMode={true} />
				</div>
			</div>
		</div>
	</div>
</div>
