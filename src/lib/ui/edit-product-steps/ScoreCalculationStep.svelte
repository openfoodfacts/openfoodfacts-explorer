<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';

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
</script>

<div class="space-y-6">
	<div class="alert alert-info text-sm sm:text-base">
		<div>
			<p class="font-semibold">{$_('product.edit.sections.score_calculation')}</p>
			<p class="text-xs sm:text-sm mt-1">{$_('product.edit.score_calculation_description')}</p>
			<p class="text-xs opacity-70 mt-1">{$_('product.edit.skip_score_info')}</p>
		</div>
	</div>

	<!-- Accordion container for ingredients, nutrition, and packaging -->
	<div class="space-y-4">
		<!-- Ingredients (Open by default) -->
		<div class="collapse collapse-arrow bg-base-200 border border-base-300 rounded-lg">
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
		<div class="collapse collapse-arrow bg-base-200 border border-base-300 rounded-lg">
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

		<!-- Packaging -->
		<div class="collapse collapse-arrow bg-base-200 border border-base-300 rounded-lg">
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
