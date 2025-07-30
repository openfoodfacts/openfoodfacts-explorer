<script lang="ts">
	import StepNav from '../StepNav.svelte';
	import InfoTooltip from '../InfoTooltip.svelte';
	import { _ } from '$lib/i18n';
	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';

	type Props = {
		productStore: Writable<Product>;
		currentStep: number;
		stepsLength: number;
		showInfoNutrition: boolean;
		getLanguage: (code: string) => string;
		getNutritionImage: (language: string) => string | null;
		handleNutrimentInput: (e: Event, key: string) => void;
		prevStep: () => void;
		nextStep: () => void;
		onToggleInfo: () => void;
	};

	let {
		productStore,
		currentStep,
		stepsLength,
		showInfoNutrition,
		getLanguage,
		getNutritionImage,
		handleNutrimentInput,
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
			<span class="icon-[mdi--nutrition] mr-1 h-6 w-6 align-middle"></span>
			{$_('product.edit.sections.nutrition')}
			<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={onToggleInfo}>
				<span
					class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
				></span>
			</button>
		</h2>
		{#if showInfoNutrition}
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
					>{$_('product.edit.info.nutrition')}</span
				>
			</div>
		{/if}
		<StepNav {currentStep} {stepsLength} onPrev={prevStep} onNext={nextStep} />
		<div class="tabs tabs-box mb-4">
			{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
				<input
					type="radio"
					name="nutrition_image_tabs"
					class="tab text-xs sm:text-sm"
					aria-label={getLanguage(code)}
					checked={code === $productStore.lang}
				/>
				<div class="tab-content p-6">
					{#if getNutritionImage(code)}
						<img
							src={getNutritionImage(code)}
							alt={`Nutrition facts for ${getLanguage(code)}`}
							class="mb-4 h-auto max-w-full"
						/>
					{:else}
						<p class="alert alert-warning mb-4 text-sm sm:text-base">
							{$_('product.edit.no_nutrition_image')}
						</p>
					{/if}
				</div>
			{/each}
			{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
				<div class="alert alert-warning text-sm sm:text-base">
					{$_('product.edit.no_languages_found')}
				</div>
			{/if}
		</div>
		<div class="space-y-6">
			<div class="form-control">
				<label class="label" for="serving-size-input">
					<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
						{$_('product.edit.serving_size')}
						<InfoTooltip text={$_('product.edit.tooltips.serving_size')} />
					</span>
				</label>
				<input
					id="serving-size-input"
					type="text"
					class="input input-bordered w-full text-sm sm:text-base"
					bind:value={$productStore.serving_size}
					placeholder="e.g., 100g, 1 serving (30g)"
				/>
			</div>
			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={$productStore.no_nutrition_data} />
					<span class="label-text text-sm font-medium sm:text-base"
						>{$_('product.edit.no_nutrition_data')}</span
					>
				</label>
			</div>
			{#if !$productStore.no_nutrition_data}
				<div class="space-y-6">
					<div class="divider">
						<span class="text-sm font-medium opacity-60"
							>{$_('product.edit.nutritional_values')}</span
						>
					</div>
					<!-- Energy -->
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="form-control">
							<label class="label" for="energy-kj-input">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.energy_kj')}</span
								>
							</label>
							<input
								id="energy-kj-input"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.['energy-kj_100g'] ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'energy-kj_100g')}
								placeholder="2100"
								step="1"
								min="0"
							/>
						</div>
						<div class="form-control">
							<label class="label" for="energy-kcal-input">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.energy_kcal')}</span
								>
							</label>
							<input
								id="energy-kcal-input"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.['energy-kcal_100g'] ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'energy-kcal_100g')}
								placeholder="500"
								step="1"
								min="0"
							/>
						</div>
					</div>
					<!-- Macronutrients -->
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="form-control">
							<label class="label" for="fat-input">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.fat')}</span
								>
							</label>
							<input
								id="fat-input"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.fat_100g ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'fat_100g')}
								placeholder="10.5"
								step="0.1"
								min="0"
							/>
						</div>
						<div class="form-control">
							<label class="label" for="saturated-fat-input">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.saturated_fat')}</span
								>
							</label>
							<input
								id="saturated-fat-input"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.['saturated-fat_100g'] ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'saturated-fat_100g')}
								placeholder="3.2"
								step="0.1"
								min="0"
							/>
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="form-control">
							<label class="label" for="carbohydrates-input">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.carbohydrates')}</span
								>
							</label>
							<input
								id="carbohydrates-input"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.carbohydrates_100g ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'carbohydrates_100g')}
								placeholder="60.0"
								step="0.1"
								min="0"
							/>
						</div>
						<div class="form-control">
							<label class="label" for="sugars-input">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.sugars')}</span
								>
							</label>
							<input
								id="sugars-input"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.sugars_100g ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'sugars_100g')}
								placeholder="5.0"
								step="0.1"
								min="0"
							/>
						</div>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div class="form-control">
							<label class="label" for="proteins-input">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.proteins')}</span
								>
							</label>
							<input
								id="proteins-input"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.proteins_100g ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'proteins_100g')}
								placeholder="12.0"
								step="0.1"
								min="0"
							/>
						</div>
						<div class="form-control">
							<label class="label" for="salt-input">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.salt')}</span
								>
							</label>
							<input
								id="salt-input"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.salt_100g ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'salt_100g')}
								placeholder="1.2"
								step="0.01"
								min="0"
							/>
						</div>
						<div class="form-control">
							<label class="label" for="sodium-input">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.sodium')}</span
								>
							</label>
							<input
								id="sodium-input"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.sodium_100g ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'sodium_100g')}
								placeholder="0.48"
								step="0.01"
								min="0"
							/>
						</div>
					</div>
				</div>
			{:else}
				<div class="alert alert-info">
					<span class="icon-[mdi--information] h-5 w-5"></span>
					<span class="text-sm sm:text-base">{$_('product.edit.no_nutrition_specified')}</span>
				</div>
			{/if}
		</div>
	</div>
</div>
