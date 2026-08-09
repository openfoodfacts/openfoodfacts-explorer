<script lang="ts">
	import ProductTypeStep from './edit-product-steps/ProductTypeStep.svelte';
	import ImagesStep from './edit-product-steps/ImagesStep.svelte';
	import BasicInfoStep from './edit-product-steps/BasicInfoStep.svelte';
	import ScoreCalculationStep from './edit-product-steps/ScoreCalculationStep.svelte';
	import IconMdiArrowLeft from '@iconify-svelte/mdi/arrow-left';
	import IconMdiArrowRight from '@iconify-svelte/mdi/arrow-right';
	import type { Product } from '$lib/api';

	import { _ } from '$lib/i18n';
	import { getToastCtx } from '$lib/stores/toasts';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	const toastCtx = getToastCtx();

	const STEPS = $derived([
		{
			title: $_('product.edit.sections.product_type_step', { default: 'Product Type' }),
			suffix: $_('product.edit.mandatory_suffix', { default: '(mandatory)' })
		},
		{
			title: $_('product.edit.sections.take_photos', { default: 'Take key photos of the product' })
		},
		{ title: $_('product.edit.sections.basic_info', { default: 'Basic Information' }) },
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
		if (!product.product_type && parsed > 1) {
			return 0;
		}
		return parsed - 1; // Convert to zero-based index
	});

	function gotoStep(step: number) {
		if (step < 0 || step >= STEPS.length) {
			return;
		}

		if (step > 0 && !isProductTypeSelected) {
			toastCtx.warning(
				$_('product.edit.select_product_type_first', {
					default: 'You need to select a product type first!'
				})
			);
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

	let isProductTypeSelected = $derived(Boolean(product.product_type));

	$effect(() => {
		const stepStr = page.url.searchParams.get('step');
		if (!isProductTypeSelected && stepStr && stepStr !== '1') {
			const params = new SvelteURLSearchParams(page.url.search);
			params.set('step', '1');
			goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
		}
	});
</script>

<!-- Desktop step navigation -->
<div class="mb-6 hidden md:block">
	<ul class="steps w-full text-xs sm:text-sm">
		{#each STEPS as step, i (step.title)}
			{@const isStepDisabled = i > 0 && !isProductTypeSelected}
			<button
				type="button"
				class="step {i <= currentStep ? 'step-secondary' : ''} {isStepDisabled
					? 'cursor-not-allowed opacity-40'
					: 'cursor-pointer'} transition-colors"
				disabled={isStepDisabled}
				onclick={() => gotoStep(i)}
				aria-label={`Go to step ${i + 1}: ${step.title} ${step.suffix ?? ''}`}
				title={isStepDisabled
					? $_('product.edit.select_product_type_first', {
							default: 'You need to select a product type first!'
						})
					: undefined}
			>
				<span class="flex flex-col items-center">
					<span>{step.title}</span>
					{#if step.suffix}
						<span class="mt-0.5 text-xs font-normal opacity-70">{step.suffix}</span>
					{/if}
				</span>
			</button>
		{/each}
	</ul>
</div>

<!-- Mobile step header -->
<div class="navigation mb-6 flex items-center justify-between md:hidden">
	<button class="btn btn-outline btn-sm" onclick={prevStep} type="button" title={$_('common.back')}>
		<IconMdiArrowLeft class="h-4 w-4" />
		{$_('common.back')}
	</button>

	<div class="my-2 rounded-full bg-primary/10 px-3 py-2 text-sm">
		<span class="font-medium text-primary/80">
			{$_('common.step')}
			{`${currentStep + 1}`}
		</span>
		<span class="font-medium text-primary/60">{$_('common.of')}{` ${STEPS.length}`}</span>
	</div>

	<button
		class="btn btn-secondary btn-sm"
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
	<ProductTypeStep bind:product />
{:else if currentStep === 1}
	<ImagesStep bind:product />
{:else if currentStep === 2}
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
{:else if currentStep === 3}
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
	class="mt-8 mb-24 flex flex-col items-stretch justify-between gap-3 pb-8 md:mb-28 md:flex-row md:items-center"
>
	{#if currentStep > 0}
		<button
			class="btn w-full shrink-0 btn-outline text-sm sm:text-base md:w-auto md:min-w-40"
			onclick={prevStep}
			type="button"
		>
			<IconMdiArrowLeft class="mr-2 h-4 w-4" />{$_('common.back', { default: 'Back' })}
		</button>
	{/if}

	<div class="flex w-full flex-col justify-end gap-3 md:flex-row">
		{#if currentStep === 0 || currentStep === 1}
			<button
				class="btn w-full text-sm btn-secondary sm:text-base md:ml-auto md:w-auto md:min-w-40"
				onclick={nextStep}
				type="button"
			>
				{$_('common.next', { default: 'Next' })}<IconMdiArrowRight class="ml-2 h-4 w-4" />
			</button>
		{:else if currentStep === 2}
			<button
				class="btn w-full text-sm btn-success sm:text-base md:w-auto md:min-w-40"
				onclick={submit}
				disabled={isSubmitting || disableSubmit}
				type="button"
			>
				{#if isSubmitting}
					<span class="loading mr-2 loading-sm loading-spinner"></span>
				{/if}
				{$_('product.edit.submit_product', { default: 'Submit' })}
			</button>
			<button
				class="btn w-full text-sm btn-secondary sm:text-base md:w-auto md:min-w-40"
				onclick={nextStep}
				type="button"
			>
				{$_('product.edit.continue_to_score', { default: 'Score Calculation' })}
				<IconMdiArrowRight class="ml-2 h-4 w-4" />
			</button>
		{:else if currentStep === 3}
			<button
				class="btn w-full text-sm btn-success sm:text-base md:ml-auto md:w-auto md:min-w-40"
				onclick={submit}
				disabled={isSubmitting || disableSubmit}
				type="button"
			>
				{#if isSubmitting}
					<span class="loading mr-2 loading-sm loading-spinner"></span>
				{/if}
				{$_('product.edit.submit_product', { default: 'Submit' })}
			</button>
		{/if}
	</div>
</div>
