<script lang="ts">
	import InfoTooltip from '../InfoTooltip.svelte';
	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';
	import ISO6391 from 'iso-639-1';
	import { PRODUCT_IMAGE_URL } from '$lib/const';
	import { _ } from '$lib/i18n';

	type Props = {
		productStore: Writable<Product>;
	};

	let { productStore }: Props = $props();

	let showInfoNutrition = $state(false);

	const getLanguage = ISO6391.getName;

	function getNutritionImage(language: string) {
		const productData = $productStore;
		if (!productData.code || !productData.images) return null;
		const paddedBarcode = productData.code.toString().padStart(13, '0');
		const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
		if (!match) return null;
		const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
		const imageName = 'nutrition_' + language;
		const image = productData.images[imageName];
		if ('rev' in image === false || !image.rev) return null;
		const filename = `${imageName}.${image.rev}.400.jpg`;
		return PRODUCT_IMAGE_URL(`${path}/${filename}`);
	}

	function handleNutrimentInput(e: Event, key: string) {
		const target = e.currentTarget as HTMLInputElement;
		productStore.update((store) => {
			store.nutriments = { ...store.nutriments, [key]: target.value ? Number(target.value) : null };
			return store;
		});
	}
</script>

<div class="collapse-arrow bg-base-100 collapse shadow-md">
	<input type="checkbox" />
	<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
		<span class="icon-[mdi--nutrition] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
		{$_('product.edit.sections.nutrition')}
	</div>
	<div class="collapse-content">
		<button
			type="button"
			class="mb-2"
			aria-label="Info"
			onclick={() => (showInfoNutrition = !showInfoNutrition)}
		>
			<span
				class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
			></span>
		</button>
		{#if showInfoNutrition}
			<div
				class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
			>
				<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
				<span class="text-base-content/80 p-4 text-sm sm:text-base"
					>{$_('product.edit.info.nutrition')}</span
				>
				<button
					type="button"
					class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
					aria-label="Close"
					onclick={() => (showInfoNutrition = false)}
				>
					<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
				</button>
			</div>
		{/if}
		<div class="tabs tabs-box mb-4">
			{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
				<input
					type="radio"
					name="nutrition_image_tabs_edit"
					class="tab text-xs sm:text-sm"
					aria-label={getLanguage(code)}
					checked={code === $productStore.lang}
				/>
				<div class="tab-content p-6">
					{#if getNutritionImage(code)}
						<img
							src={getNutritionImage(code)}
							alt="Nutrition facts for {getLanguage(code)}"
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
				<label class="label" for="serving-size-edit">
					<span class="label-text flex items-center gap-2 text-sm font-medium sm:text-base">
						{$_('product.edit.serving_size')}
						<InfoTooltip text={$_('product.edit.tooltips.serving_size')} />
					</span>
				</label>
				<input
					id="serving-size-edit"
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
						<span class="text-sm font-medium opacity-60">Nutritional Values</span>
					</div>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="form-control">
							<label class="label" for="energy-kj-edit">
								<span class="label-text text-sm font-medium sm:text-base">Energy (kJ)</span>
							</label>
							<input
								id="energy-kj-edit"
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
							<label class="label" for="energy-kcal-edit">
								<span class="label-text text-sm font-medium sm:text-base">Energy (kcal)</span>
							</label>
							<input
								id="energy-kcal-edit"
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
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div class="form-control">
							<label class="label" for="fat-edit">
								<span class="label-text text-sm font-medium sm:text-base">Fat (g)</span>
							</label>
							<input
								id="fat-edit"
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
							<label class="label" for="saturated-fat-edit">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.saturated_fat')}</span
								>
							</label>
							<input
								id="saturated-fat-edit"
								type="number"
								class="input input-bordered w-full text-sm sm:text-base"
								value={$productStore.nutriments?.['saturated-fat_100g'] ?? ''}
								oninput={(e) => handleNutrimentInput(e, 'saturated-fat_100g')}
								placeholder="3.2"
								step="0.1"
								min="0"
							/>
						</div>
						<div class="form-control">
							<label class="label" for="carbohydrates-edit">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.carbohydrates')}</span
								>
							</label>
							<input
								id="carbohydrates-edit"
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
							<label class="label" for="sugars-edit">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.sugars')}</span
								>
							</label>
							<input
								id="sugars-edit"
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
							<label class="label" for="proteins-edit">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.proteins')}</span
								>
							</label>
							<input
								id="proteins-edit"
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
							<label class="label" for="salt-edit">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.salt')}</span
								>
							</label>
							<input
								id="salt-edit"
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
							<label class="label" for="sodium-edit">
								<span class="label-text text-sm font-medium sm:text-base"
									>{$_('product.edit.sodium')}</span
								>
							</label>
							<input
								id="sodium-edit"
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
