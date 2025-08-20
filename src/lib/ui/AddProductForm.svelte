<script lang="ts">
	import ImagesStep from './edit-product-steps/ImagesStep.svelte';
	import BasicInfoStep from './edit-product-steps/BasicInfoStep.svelte';
	import LanguagesStep from './edit-product-steps/LanguagesStep.svelte';
	import IngredientsStep from './edit-product-steps/IngredientsStep.svelte';
	import NutritionStep from './edit-product-steps/NutritionStep.svelte';
	import CommentStep from './edit-product-steps/CommentStep.svelte';
	import type { Product } from '$lib/api';

	import { _ } from '$lib/i18n';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let currentStep = $derived.by(() => {
		const params = page.url.searchParams;
		const step = params.get('step') || '1';
		return parseInt(step, 10) - 1; // Convert to zero-based index
	});

	const STEPS = $derived([
		$_('product.edit.sections.images'),
		$_('product.edit.sections.basic_info'),
		$_('product.edit.sections.languages'),
		$_('product.edit.sections.ingredients'),
		$_('product.edit.sections.nutrition'),
		$_('product.edit.sections.comment')
	]);

	function gotoStep(step: number) {
		if (step < 0 || step >= STEPS.length) {
			return;
		}

		const params = page.url.searchParams;
		params.set('step', (step + 1).toString());
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	const nextStep = () => gotoStep(currentStep + 1);
	const prevStep = () => gotoStep(currentStep - 1);

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

<!-- Desktop step navigation -->
<div class="mb-6 hidden md:block">
	<ul class="steps w-full text-xs sm:text-sm">
		{#each STEPS as step, i (step)}
			<button
				type="button"
				class="step {i <= currentStep ? 'step-secondary' : ''} cursor-pointer transition-colors"
				onclick={() => gotoStep(i)}
				aria-label={`Go to step ${i + 1}: ${step}`}
			>
				{step}
			</button>
		{/each}
	</ul>
</div>

<!-- Mobile step header -->
<div class="navigation mb-6 flex items-center justify-between md:hidden">
	<button class="btn btn-sm btn-outline" onclick={prevStep} type="button" title={$_('common.back')}>
		<span class="icon-[mdi--arrow-left] h-4 w-4"></span>
		{$_('common.back')}
	</button>

	<div class="bg-primary/10 my-2 rounded-full px-3 py-2 text-sm">
		<span class="text-primary/80 font-medium">
			{$_('common.step')}
			{`${currentStep + 1}`}
		</span>
		<span class="text-primary/60 font-medium">{$_('common.of')}{` ${STEPS.length}`}</span>
	</div>

	<button
		class="btn btn-sm btn-secondary"
		class:opacity-0={currentStep === STEPS.length - 1}
		disabled={currentStep === STEPS.length - 1}
		onclick={nextStep}
		type="button"
		title={$_('common.next')}
	>
		{$_('common.next')} <span class="icon-[mdi--arrow-right] h-4 w-4"></span>
	</button>
</div>

<!-- Step Components -->
{#if currentStep === 0}
	<ImagesStep bind:product />
{:else if currentStep === 1}
	<BasicInfoStep
		bind:product
		{categoryNames}
		{labelNames}
		{brandNames}
		{storeNames}
		{originNames}
		{countriesNames}
	/>
{:else if currentStep === 2}
	<LanguagesStep bind:product {filteredLanguages} {addLanguage} {getLanguage} />
{:else if currentStep === 3}
	<IngredientsStep bind:product {getLanguage} {getIngredientsImage} />
{:else if currentStep === 4}
	<NutritionStep bind:product {getLanguage} {getNutritionImage} {handleNutrimentInput} />
{:else if currentStep === 5}
	<CommentStep bind:comment />
{/if}

<!-- Navigation Buttons for Add Mode -->
<div class="mt-8 flex justify-between gap-3">
	{#if currentStep > 0}
		<button
			class="btn btn-outline min-w-50 text-sm max-md:grow sm:text-base"
			onclick={prevStep}
			type="button"
		>
			<span class="icon-[mdi--arrow-left] mr-2"></span>{$_('common.back')}
		</button>
	{/if}

	{#if currentStep < STEPS.length - 1}
		<button
			class="btn btn-secondary min-w-50 text-sm max-md:grow sm:text-base"
			onclick={nextStep}
			type="button"
		>
			{$_('common.next')}<span class="icon-[mdi--arrow-right] ml-2"></span>
		</button>
	{:else}
		<button
			class="btn btn-success min-w-50 text-sm max-md:grow sm:text-base"
			onclick={submit}
			disabled={isSubmitting}
			type="button"
		>
			{#if isSubmitting}
				<span class="loading loading-spinner loading-sm mr-2"></span>
			{/if}
			{$_('product.edit.add_product')}
		</button>
	{/if}
</div>
