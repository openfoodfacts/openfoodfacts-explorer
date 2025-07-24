<script lang="ts">
	import StepNav from '../../../routes/products/[barcode]/edit/StepNav.svelte';
	import { _ } from '$lib/i18n';
	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';

	interface Props {
		productStore: Writable<Product>;
		currentStep: number;
		stepsLength: number;
		showInfoIngredients: boolean;
		getLanguage: (code: string) => string;
		getIngredientsImage: (language: string) => string | null;
		prevStep: () => void;
		nextStep: () => void;
		onToggleInfo: () => void;
	}

	let {
		productStore,
		currentStep,
		stepsLength,
		showInfoIngredients,
		getLanguage,
		getIngredientsImage,
		prevStep,
		nextStep,
		onToggleInfo
	}: Props = $props();
</script>

<div class="card bg-base-100 shadow-md">
	<div class="card-body p-4 sm:p-6">
		<h2
			class="text-primary mb-6 hidden items-center justify-center gap-2 text-center text-base font-bold md:block md:text-lg lg:text-xl xl:text-2xl"
		>
			<span class="icon-[mdi--format-list-bulleted] mr-1 h-6 w-6 align-middle"></span>
			{$_('product.edit.sections.ingredients')}
			<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={onToggleInfo}>
				<span
					class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
				></span>
			</button>
		</h2>
		{#if showInfoIngredients}
			<div
				class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
			>
				<button
					type="button"
					class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1"
					aria-label="Close"
					onclick={onToggleInfo}
				>
					<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
				</button>
				<span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
				<span class="text-base-content/80 p-6 text-sm sm:text-base"
					>{$_('product.edit.info.ingredients')}</span
				>
			</div>
		{/if}
		<StepNav {currentStep} {stepsLength} onPrev={prevStep} onNext={nextStep} />
		<div class="tabs tabs-box">
			{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
				<input
					type="radio"
					name="ingredients_tabs"
					class="tab text-xs sm:text-sm"
					aria-label={getLanguage(code)}
					checked={code === $productStore.lang}
				/>
				<div class="tab-content form-control p-6">
					{#if getIngredientsImage(code)}
						<img src={getIngredientsImage(code)} alt="Ingredients" class="mb-4" />
					{:else}
						<p class="alert alert-warning mb-4 text-sm sm:text-base">
							{$_('product.edit.no_ingredients_image')}
						</p>
					{/if}
					<label class="label text-sm sm:text-base" for={`ingredients-list-${code}`}
						>{$_('product.edit.ingredients_list')} ({getLanguage(code)})</label
					>
					<div class="form-control mb-4">
						<textarea
							id={`ingredients-list-${code}`}
							class="textarea textarea-bordered h-40 w-full text-sm sm:text-base"
							bind:value={$productStore[`ingredients_text_${code}`]}
						></textarea>
					</div>
				</div>
			{/each}
			{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
				<div class="alert alert-warning text-sm sm:text-base">
					{$_('product.edit.no_languages_found')}
				</div>
			{/if}
		</div>
	</div>
</div>
