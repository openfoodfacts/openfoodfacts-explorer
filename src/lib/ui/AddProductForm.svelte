<script lang="ts">
	import MobileStepHeader from './add-product-steps/MobileStepHeader.svelte';
	import DesktopStepNavigation from './add-product-steps/DesktopStepNavigation.svelte';
	import ImagesStep from './add-product-steps/ImagesStep.svelte';
	import BasicInfoStep from './add-product-steps/BasicInfoStep.svelte';
	import LanguagesStep from './add-product-steps/LanguagesStep.svelte';
	import IngredientsStep from './add-product-steps/IngredientsStep.svelte';
	import NutritionStep from './add-product-steps/NutritionStep.svelte';
	import CommentStep from './add-product-steps/CommentStep.svelte';
	import NavigationButtons from './add-product-steps/NavigationButtons.svelte';
	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';
	import StepNav from './StepNav.svelte';

	type AddProductFormProps = {
		productStore: Writable<Product>;
		comment: string;
		currentStep: number;
		steps: string[];
		showInfoImages: boolean;
		showInfoBasic: boolean;
		showInfoLanguages: boolean;
		showInfoIngredients: boolean;
		showInfoNutrition: boolean;
		showInfoComment: boolean;
		prevStep: () => void;
		nextStep: () => void;
		goToStep: (stepIndex: number) => void;
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
		toggleInfoImages: () => void;
		toggleInfoBasic: () => void;
		toggleInfoLanguages: () => void;
		toggleInfoIngredients: () => void;
		toggleInfoNutrition: () => void;
		toggleInfoComment: () => void;
		handleCommentChange: (value: string) => void;
	};

	let { props }: { props: AddProductFormProps } = $props();

	// Create reactive references to maintain reactivity
	let productStore = $derived(props.productStore);
	let comment = $derived(props.comment);
	let currentStep = $derived(props.currentStep);
	let steps = $derived(props.steps);
	let showInfoImages = $derived(props.showInfoImages);
	let showInfoBasic = $derived(props.showInfoBasic);
	let showInfoLanguages = $derived(props.showInfoLanguages);
	let showInfoIngredients = $derived(props.showInfoIngredients);
	let showInfoNutrition = $derived(props.showInfoNutrition);
	let showInfoComment = $derived(props.showInfoComment);
	let prevStep = $derived(props.prevStep);
	let nextStep = $derived(props.nextStep);
	let goToStep = $derived(props.goToStep);
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
	let toggleInfoImages = $derived(props.toggleInfoImages);
	let toggleInfoBasic = $derived(props.toggleInfoBasic);
	let toggleInfoLanguages = $derived(props.toggleInfoLanguages);
	let toggleInfoIngredients = $derived(props.toggleInfoIngredients);
	let toggleInfoNutrition = $derived(props.toggleInfoNutrition);
	let toggleInfoComment = $derived(props.toggleInfoComment);
	let handleCommentChange = $derived(props.handleCommentChange);

	// Get the appropriate toggle function based on current step
	const getToggleInfo = (step: number) => {
		switch (step) {
			case 0:
				return toggleInfoImages;
			case 1:
				return toggleInfoBasic;
			case 2:
				return toggleInfoLanguages;
			case 3:
				return toggleInfoIngredients;
			case 4:
				return toggleInfoNutrition;
			default:
				return toggleInfoComment;
		}
	};
</script>

<MobileStepHeader {currentStep} {steps} onToggleInfo={getToggleInfo(currentStep)} />

<DesktopStepNavigation {currentStep} {steps} {goToStep} />

<StepNav
	onNext={currentStep < steps.length - 1 ? nextStep : undefined}
	onPrev={currentStep > 0 ? prevStep : undefined}
/>

<!-- Step Components -->
{#if currentStep === 0}
	<ImagesStep {productStore} {showInfoImages} onToggleInfo={toggleInfoImages} />
{:else if currentStep === 1}
	<BasicInfoStep
		{productStore}
		{showInfoBasic}
		{categoryNames}
		{labelNames}
		{brandNames}
		{storeNames}
		{originNames}
		{countriesNames}
		onToggleInfo={toggleInfoBasic}
	/>
{:else if currentStep === 2}
	<LanguagesStep
		{productStore}
		{showInfoLanguages}
		{filteredLanguages}
		{addLanguage}
		{getLanguage}
		onToggleInfo={toggleInfoLanguages}
	/>
{:else if currentStep === 3}
	<IngredientsStep
		{productStore}
		{showInfoIngredients}
		{getLanguage}
		{getIngredientsImage}
		onToggleInfo={toggleInfoIngredients}
	/>
{:else if currentStep === 4}
	<NutritionStep
		{productStore}
		{showInfoNutrition}
		{getLanguage}
		{getNutritionImage}
		{handleNutrimentInput}
		onToggleInfo={toggleInfoNutrition}
	/>
{:else if currentStep === 5}
	<CommentStep
		{comment}
		{showInfoComment}
		onToggleInfo={toggleInfoComment}
		onCommentChange={handleCommentChange}
	/>
{/if}

<NavigationButtons
	{currentStep}
	stepsLength={steps.length}
	{isSubmitting}
	{prevStep}
	{nextStep}
	{submit}
/>
