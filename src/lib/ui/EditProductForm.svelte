<script lang="ts">
	import ImagesStep from './edit-product-steps/ImagesStep.svelte';
	import BasicInfoStep from './edit-product-steps/BasicInfoStep.svelte';
	import LanguagesStep from './edit-product-steps/LanguagesStep.svelte';
	import IngredientsStep from './edit-product-steps/IngredientsStep.svelte';
	import NutritionStep from './edit-product-steps/NutritionStep.svelte';
	import CommentStep from './edit-product-steps/CommentStep.svelte';

	import IconMdiTranslate from '@iconify-svelte/mdi/translate';
	import IconMdiImageMultiple from '@iconify-svelte/mdi/image-multiple';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiFormatListBulleted from '@iconify-svelte/mdi/format-list-bulleted';
	import IconMdiNutrition from '@iconify-svelte/mdi/nutrition';
	import IconMdiCommentText from '@iconify-svelte/mdi/comment-text';

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
		languages: string[];

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
		getIngredientsImage,
		getNutritionImage,
		languages,
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
	<!-- Languages Section -->
	<div class="collapse-arrow bg-base-200 collapse shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<IconMdiTranslate class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
			{$_('product.edit.sections.languages')}
		</div>
		<div class="collapse-content">
			<LanguagesStep bind:product {addLanguage} codes={languages} />
		</div>
	</div>

	<!-- Images Section -->
	<div class="collapse-arrow bg-base-200 collapse shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<IconMdiImageMultiple class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
			<IconMdiInformation class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
			{$_('product.edit.sections.basic_info')}
		</div>
		<div class="collapse-content">
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

	<!-- Ingredients Section -->
	<div class="collapse-arrow bg-base-200 collapse shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<IconMdiFormatListBulleted class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
			{$_('product.edit.sections.ingredients')}
		</div>
		<div class="collapse-content">
			<IngredientsStep bind:product {getIngredientsImage} />
		</div>
	</div>

	<!-- Nutrition Section -->
	<!-- overflow-visible is needed for the sticky image -->
	<div class="collapse-arrow bg-base-200 collapse overflow-visible shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<IconMdiNutrition class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
			{$_('product.edit.sections.nutrition')}
		</div>
		<div class="collapse-content">
			<NutritionStep bind:product {getNutritionImage} {handleNutrimentInput} />
		</div>
	</div>

	<!-- Comment Section -->
	<div class="collapse-arrow bg-base-200 collapse shadow-md">
		<input type="checkbox" checked={$preferences.editing.expandAllSections} />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<IconMdiCommentText class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
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
