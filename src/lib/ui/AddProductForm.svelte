<script lang="ts">
	import ImagesStep from './edit-product-steps/ImagesStep.svelte';
	import BasicInfoStep from './edit-product-steps/BasicInfoStep.svelte';
	import ScoreCalculationStep from './edit-product-steps/ScoreCalculationStep.svelte';
	import IconMdiArrowLeft from '@iconify-svelte/mdi/arrow-left';
	import IconMdiArrowRight from '@iconify-svelte/mdi/arrow-right';
	import type { Product } from '$lib/api';

	import { _ } from '$lib/i18n';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	const STEPS = $derived([
		{ title: $_('product.edit.sections.basic_info', { default: 'Basic Information' }) },
		{ title: $_('product.edit.sections.take_photos', { default: 'Take Some Photos' }) },
		{
			title: $_('product.edit.sections.score_calculation', { default: 'Score Calculation' }),
			suffix: $_('product.edit.optional_suffix', { default: '(optional)' })
		}
	]);

	let currentStep = $derived.by(() => {
		const params = page.url.searchParams;
		const stepStr = params.get('step');
		if (!stepStr) return 0;
		const parsed = parseInt(stepStr, 10);
		if (isNaN(parsed) || parsed < 1 || parsed > STEPS.length) {
			return 0;
		}
		return parsed - 1; // Convert to zero-based index
	});

	function gotoStep(step: number) {
		if (step < 0 || step >= STEPS.length) {
			return;
		}

		const params = new SvelteURLSearchParams(page.url.search);
		params.set('step', (step + 1).toString());
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	const nextStep = () => gotoStep(currentStep + 1);
	const prevStep = () => gotoStep(currentStep - 1);

	type Props = {
		product: Product;

		getIngredientsImage: (language: string) => string | null;
		getNutritionImage: (language: string) => string | null;
		getPackagingImage: (language: string) => string | null;

		// Submission

		isSubmitting: boolean;
		disableSubmit?: boolean;
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
		units: string[];
		allergenNames: string[];
	};

	let {
		product = $bindable(),
		comment = $bindable(),
		handleNutrimentInput,
		addLanguage,
		getIngredientsImage,
		getNutritionImage,
		getPackagingImage,
		languages,
		categoryNames,
		labelNames,
		brandNames,
		storeNames,
		originNames,
		countriesNames,
		units,
		allergenNames,
		isSubmitting,
		disableSubmit = false,
		submit
	}: Props = $props();
</script>

<!-- Desktop step navigation -->
<div class="mb-6 hidden md:block">
	<ul class="steps w-full text-xs sm:text-sm">
		{#each STEPS as step, i (step.title)}
			<button
				type="button"
				class="step {i <= currentStep ? 'step-secondary' : ''} cursor-pointer transition-colors"
				onclick={() => gotoStep(i)}
				aria-label={`Go to step ${i + 1}: ${step.title} ${step.suffix ?? ''}`}
			>
				<span class="flex flex-col items-center">
					<span>{step.title}</span>
					{#if step.suffix}
						<span class="text-xs opacity-70 font-normal mt-0.5">{step.suffix}</span>
					{/if}
				</span>
			</button>
		{/each}
	</ul>
</div>

<!-- Mobile step header -->
<div class="navigation mb-6 flex items-center justify-between md:hidden">
	<button class="btn btn-sm btn-outline" onclick={prevStep} type="button" title={$_('common.back')}>
		<IconMdiArrowLeft class="h-4 w-4" />
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
		{$_('common.next')}
		<IconMdiArrowRight class="h-4 w-4" />
	</button>
</div>

<!-- Step Components -->
{#if currentStep === 0}
	<BasicInfoStep
		bind:product
		bind:comment
		{categoryNames}
		{labelNames}
		{brandNames}
		{storeNames}
		{countriesNames}
		{originNames}
		{languages}
		{addLanguage}
		editMode={false}
	/>
{:else if currentStep === 1}
	<ImagesStep bind:product editMode={true} />
{:else if currentStep === 2}
	<ScoreCalculationStep
		bind:product
		{units}
		{getIngredientsImage}
		{getNutritionImage}
		{getPackagingImage}
		{handleNutrimentInput}
		{allergenNames}
	/>
{/if}

<!-- Navigation Buttons for Add Mode -->
<div
	class="mt-8 mb-12 flex flex-col md:flex-row justify-between gap-3 items-stretch md:items-center"
>
	{#if currentStep > 0}
		<button
			class="btn btn-outline w-full md:w-auto md:min-w-40 text-sm sm:text-base shrink-0"
			onclick={prevStep}
			type="button"
		>
			<IconMdiArrowLeft class="mr-2 h-4 w-4" />{$_('common.back', { default: 'Back' })}
		</button>
	{/if}

	<div class="flex flex-col md:flex-row gap-3 justify-end w-full">
		{#if currentStep === 0}
			<button
				class="btn btn-secondary w-full md:w-auto md:min-w-40 text-sm sm:text-base md:ml-auto"
				onclick={nextStep}
				type="button"
			>
				{$_('common.next', { default: 'Next' })}<IconMdiArrowRight class="ml-2 h-4 w-4" />
			</button>
		{:else if currentStep === 1}
			<button
				class="btn btn-success w-full md:w-auto md:min-w-40 text-sm sm:text-base"
				onclick={submit}
				disabled={isSubmitting || disableSubmit}
				type="button"
			>
				{#if isSubmitting}
					<span class="loading loading-spinner loading-sm mr-2"></span>
				{/if}
				{$_('product.edit.submit_product', { default: 'Submit' })}
			</button>
			<button
				class="btn btn-secondary w-full md:w-auto md:min-w-40 text-sm sm:text-base"
				onclick={nextStep}
				type="button"
			>
				{$_('product.edit.continue_to_score', { default: 'Score Calculation' })}
				<IconMdiArrowRight class="ml-2 h-4 w-4" />
			</button>
		{:else if currentStep === 2}
			<button
				class="btn btn-success w-full md:w-auto md:min-w-40 text-sm sm:text-base md:ml-auto"
				onclick={submit}
				disabled={isSubmitting || disableSubmit}
				type="button"
			>
				{#if isSubmitting}
					<span class="loading loading-spinner loading-sm mr-2"></span>
				{/if}
				{$_('product.edit.submit_product', { default: 'Submit' })}
			</button>
		{/if}
	</div>
</div>
