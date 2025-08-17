<script lang="ts">
	import ImagesStep from './add-product-steps/ImagesStep.svelte';
	import BasicInfoStep from './add-product-steps/BasicInfoStep.svelte';
	import LanguagesStep from './add-product-steps/LanguagesStep.svelte';
	import IngredientsStep from './add-product-steps/IngredientsStep.svelte';
	import NutritionStep from './add-product-steps/NutritionStep.svelte';
	import CommentStep from './add-product-steps/CommentStep.svelte';
	import NavigationButtons from './add-product-steps/NavigationButtons.svelte';
	import type { Writable } from 'svelte/store';
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

	type AddProductFormProps = {
		productStore: Writable<Product>;
		comment: string;
		handleNutrimentInput: (e: Event, key: string) => void;
		addLanguage: (code: string) => void;
		getLanguage: (code: string) => string;
		getIngredientsImage: (language: string) => string | null;
		getNutritionImage: (language: string) => string | null;
		filteredLanguages: string[];
		categoryNames: string[];
		labelNames: string[];
		brandNames: string[];
		storeNames: string[];
		originNames: string[];
		countriesNames: string[];
		isSubmitting: boolean;
		submit: () => Promise<void>;
		handleCommentChange: (value: string) => void;
	};

	let { props }: { props: AddProductFormProps } = $props();

	// Create reactive references to maintain reactivity
	let productStore = $derived(props.productStore);
	let comment = $derived(props.comment);
	let handleNutrimentInput = $derived(props.handleNutrimentInput);
	let addLanguage = $derived(props.addLanguage);
	let getLanguage = $derived(props.getLanguage);
	let getIngredientsImage = $derived(props.getIngredientsImage);
	let getNutritionImage = $derived(props.getNutritionImage);
	let filteredLanguages = $derived(props.filteredLanguages);
	let categoryNames = $derived(props.categoryNames);
	let labelNames = $derived(props.labelNames);
	let brandNames = $derived(props.brandNames);
	let storeNames = $derived(props.storeNames);
	let originNames = $derived(props.originNames);
	let countriesNames = $derived(props.countriesNames);
	let isSubmitting = $derived(props.isSubmitting);
	let submit = $derived(props.submit);

	let handleCommentChange = $derived(props.handleCommentChange);
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
	<ImagesStep {productStore} />
{:else if currentStep === 1}
	<BasicInfoStep
		{productStore}
		{categoryNames}
		{labelNames}
		{brandNames}
		{storeNames}
		{originNames}
		{countriesNames}
	/>
{:else if currentStep === 2}
	<LanguagesStep {productStore} {filteredLanguages} {addLanguage} {getLanguage} />
{:else if currentStep === 3}
	<IngredientsStep {productStore} {getLanguage} {getIngredientsImage} />
{:else if currentStep === 4}
	<NutritionStep {productStore} {getLanguage} {getNutritionImage} {handleNutrimentInput} />
{:else if currentStep === 5}
	<CommentStep {comment} onCommentChange={handleCommentChange} />
{/if}

<NavigationButtons
	{currentStep}
	stepsLength={STEPS.length}
	{isSubmitting}
	{prevStep}
	{nextStep}
	{submit}
/>
