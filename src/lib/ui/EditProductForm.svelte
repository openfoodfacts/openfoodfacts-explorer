<script lang="ts">
	import ImagesStep from './edit-product-steps/ImagesStep.svelte';
	import BasicInfoStep from './edit-product-steps/BasicInfoStep.svelte';
	import LanguagesStep from './edit-product-steps/LanguagesStep.svelte';
	import IngredientsStep from './edit-product-steps/IngredientsStep.svelte';
	import NutritionStep from './edit-product-steps/NutritionStep.svelte';
	import CommentStep from './edit-product-steps/CommentStep.svelte';

	import type { Product } from '$lib/api';
	import { _ } from '$lib/i18n';
	import { preferences } from '$lib/settings';

	type Props = {
		product: Product;

		getIngredientsImage: (language: string) => string | null;
		getNutritionImage: (language: string) => string | null;

		// Submission

		isSubmitting: boolean;
		submit: () => Promise<void>;
		comment: string;
		handleNutrimentInput: (e: Event, key: string) => void;

		// Language

		addLanguage: (code: string) => void;
		getLanguage: (code: string) => string;
		filteredLanguages: string[];

		// Taxonomy entries

		categoryNames: string[];
		labelNames: string[];
		brandNames: string[];
		storeNames: string[];
		originNames: string[];
		countriesNames: string[];
	};

	let {
		product = $bindable(),
		comment = $bindable(),
		handleNutrimentInput,
		addLanguage,
		getLanguage,
		getIngredientsImage,
		getNutritionImage,
		filteredLanguages,
		categoryNames,
		labelNames,
		brandNames,
		storeNames,
		originNames,
		countriesNames,
		isSubmitting,
		submit
	}: Props = $props();
</script>

<div class="space-y-4">
	<!-- Images Section -->
	<div class="collapse-arrow bg-base-200 collapse shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--image-multiple] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.images')}
		</div>
		<div class="collapse-content">
			<ImagesStep bind:product />
		</div>
	</div>

	<!-- Basic Info Section -->
	<div class="collapse-arrow bg-base-200 collapse shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--information] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.basic_info')}
		</div>
		<div class="collapse-content overflow-hidden">
			<BasicInfoStep
				bind:product
				{brandNames}
				{categoryNames}
				{countriesNames}
				{labelNames}
				{originNames}
				{storeNames}
			/>
		</div>
	</div>

	<!-- Languages Section -->
	<div class="collapse-arrow bg-base-200 collapse shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--translate] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.languages')}
		</div>
		<div class="collapse-content">
			<LanguagesStep bind:product {addLanguage} {getLanguage} {filteredLanguages} />
		</div>
	</div>

	<!-- Ingredients Section -->
	<div class="collapse-arrow bg-base-200 collapse shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--format-list-bulleted] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.ingredients')}
		</div>
		<div class="collapse-content">
			<IngredientsStep bind:product {getIngredientsImage} {getLanguage} />
		</div>
	</div>

	<!-- Nutrition Section -->
	<!-- overflow-visible is needed for the sticky image -->
	<div class="collapse-arrow bg-base-200 collapse overflow-visible shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--nutrition] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.nutrition')}
		</div>
		<div class="collapse-content">
			<NutritionStep bind:product {getLanguage} {getNutritionImage} {handleNutrimentInput} />
		</div>
	</div>

	<!-- Comment Section -->
	<div class="collapse-arrow bg-base-200 collapse shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--comment-text] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.comment')}
		</div>
		<div class="collapse-content">
			<CommentStep bind:comment />
		</div>
	</div>

	<div class="mt-8 flex justify-end">
		<button
			class="btn btn-primary w-full text-sm sm:w-auto sm:text-base"
			class:loading={isSubmitting}
			onclick={submit}
			disabled={isSubmitting}
			type="button"
		>
			{$_('product.edit.save_btn')}
		</button>
	</div>
</div>
