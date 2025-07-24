<script lang="ts">
	import MobileStepHeader from './AddProductSteps/MobileStepHeader.svelte';
	import DesktopStepNavigation from './AddProductSteps/DesktopStepNavigation.svelte';
	import ImagesStep from './AddProductSteps/ImagesStep.svelte';
	import BasicInfoStep from './AddProductSteps/BasicInfoStep.svelte';
	import LanguagesStep from './AddProductSteps/LanguagesStep.svelte';
	import IngredientsStep from './AddProductSteps/IngredientsStep.svelte';
	import NutritionStep from './AddProductSteps/NutritionStep.svelte';
	import CommentStep from './AddProductSteps/CommentStep.svelte';
	import NavigationButtons from './AddProductSteps/NavigationButtons.svelte';
	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';

	interface AddProductFormProps {
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
	}

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
</script>

<MobileStepHeader
	{currentStep}
	{steps}
	onToggleInfo={currentStep === 0
		? toggleInfoImages
		: currentStep === 1
			? toggleInfoBasic
			: currentStep === 2
				? toggleInfoLanguages
				: currentStep === 3
					? toggleInfoIngredients
					: currentStep === 4
						? toggleInfoNutrition
						: toggleInfoComment}
/>

<DesktopStepNavigation {currentStep} {steps} {goToStep} />

<!-- Step Components -->
{#if currentStep === 0}
	<ImagesStep
		{productStore}
		{currentStep}
		stepsLength={steps.length}
		{showInfoImages}
		{prevStep}
		{nextStep}
		onToggleInfo={toggleInfoImages}
	/>
{:else if currentStep === 1}
	<BasicInfoStep
		{productStore}
		{currentStep}
		stepsLength={steps.length}
		{showInfoBasic}
		{categoryNames}
		{labelNames}
		{brandNames}
		{storeNames}
		{originNames}
		{countriesNames}
		{prevStep}
		{nextStep}
		onToggleInfo={toggleInfoBasic}
	/>
{:else if currentStep === 2}
	<LanguagesStep
		{productStore}
		{currentStep}
		stepsLength={steps.length}
		{showInfoLanguages}
		{filteredLanguages}
		{addLanguage}
		{getLanguage}
		{prevStep}
		{nextStep}
		onToggleInfo={toggleInfoLanguages}
	/>
{:else if currentStep === 3}
	<IngredientsStep
		{productStore}
		{currentStep}
		stepsLength={steps.length}
		{showInfoIngredients}
		{getLanguage}
		{getIngredientsImage}
		{prevStep}
		{nextStep}
		onToggleInfo={toggleInfoIngredients}
	/>
{:else if currentStep === 4}
	<NutritionStep
		{productStore}
		{currentStep}
		stepsLength={steps.length}
		{showInfoNutrition}
		{getLanguage}
		{getNutritionImage}
		{handleNutrimentInput}
		{prevStep}
		{nextStep}
		onToggleInfo={toggleInfoNutrition}
	/>
{:else if currentStep === 5}
	<CommentStep
		{comment}
		{currentStep}
		stepsLength={steps.length}
		{showInfoComment}
		{prevStep}
		{nextStep}
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
