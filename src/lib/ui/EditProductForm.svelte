<script lang="ts">
	import TagsString from '../../routes/products/[barcode]/edit/TagsString.svelte';
	import TraceabilityCodes from '../../routes/products/[barcode]/edit/TraceabilityCodes.svelte';
	import PhotoManager from '../../routes/products/[barcode]/edit/PhotoManager.svelte';
	import { PRODUCT_IMAGE_URL } from '$lib/const';
	import { writable } from 'svelte/store';
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';

	type Props = {
		product: any;
		onSave: (data: any) => void;
	};
	let { product, onSave }: Props = $props();

	let formProduct = writable({ ...product });
	let comment = $state('');

	// Info toggles for collapsible sections
	let showInfoImages = $state(false);
	let showInfoBasic = $state(false);
	let showInfoLanguages = $state(false);
	let showInfoIngredients = $state(false);
	let showInfoNutrition = $state(false);
	let showInfoComment = $state(false);

	// Language section state
	let languageCodes = $state(ISO6391.getAllCodes());
	let languageSearch = $state('');
	let filteredLanguages = $state(languageCodes);

	$effect(() => {
		filteredLanguages = languageCodes.filter((code) => {
			if ($formProduct.languages_codes && $formProduct.languages_codes[code] !== undefined) {
				return false;
			}
			const language = ISO6391.getName(code);
			return language.toLowerCase().includes(languageSearch.toLowerCase());
		});
	});

	function addLanguage(code: string) {
		formProduct.update((store) => {
			store.languages_codes = { ...store.languages_codes, [code]: 0 };
			return store;
		});
	}

	function getLanguage(code: string) {
		return ISO6391.getName(code);
	}

	// Ingredients/Nutrition helpers
	function getIngredientsImage(language: string) {
		const productData = $formProduct;
		if (!productData.code || !productData.images) return null;
		const paddedBarcode = productData.code.toString().padStart(13, '0');
		const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
		if (!match) return null;
		const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
		const imageName = 'ingredients_' + language;
		const image = productData.images[imageName];
		if (!image || !image.rev) return null;
		const filename = `${imageName}.${image.rev}.400.jpg`;
		return PRODUCT_IMAGE_URL(`${path}/${filename}`);
	}
	function getNutritionImage(language: string) {
		const productData = $formProduct;
		if (!productData.code || !productData.images) return null;
		const paddedBarcode = productData.code.toString().padStart(13, '0');
		const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
		if (!match) return null;
		const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
		const imageName = 'nutrition_' + language;
		const image = productData.images[imageName];
		if (!image || !image.rev) return null;
		const filename = `${imageName}.${image.rev}.400.jpg`;
		return PRODUCT_IMAGE_URL(`${path}/${filename}`);
	}

	function handleNutrimentInput(e: Event, key: string) {
		const target = e.currentTarget as HTMLInputElement;
		formProduct.update((store) => {
			if (!store.nutriments) store.nutriments = {};
			store.nutriments[key] = target.value ? Number(target.value) : null;
			return store;
		});
	}

	function handleSubmit() {
		formProduct.update((p) => {
			onSave({ ...p, comment });
			return p;
		});
	}
</script>

<div class="space-y-4">
	<!-- Images Section -->
	<div class="collapse-arrow bg-base-100 collapse shadow-md">
		<input type="checkbox" />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--image-multiple] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.images')}
		</div>
		<div class="collapse-content">
			<button
				type="button"
				class="mb-2"
				aria-label="Info"
				onclick={() => (showInfoImages = !showInfoImages)}
			>
				<span
					class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
				></span>
			</button>
			{#if showInfoImages}
				<div
					class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
				>
					<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
					<span class="text-base-content/80 p-4 text-sm sm:text-base"
						>{$_('product.edit.info.images')}</span
					>
					<button
						type="button"
						class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
						aria-label="Close"
						onclick={() => (showInfoImages = false)}
					>
						<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
					</button>
				</div>
			{/if}
			<PhotoManager product={$formProduct} />
		</div>
	</div>

	<!-- Basic Info Section -->
	<div class="collapse-arrow bg-base-100 collapse shadow-md">
		<input type="checkbox" />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--information] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.basic_info')}
		</div>
		<div class="collapse-content overflow-hidden">
			<button
				type="button"
				class="mb-2"
				aria-label="Info"
				onclick={() => (showInfoBasic = !showInfoBasic)}
			>
				<span
					class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
				></span>
			</button>
			{#if showInfoBasic}
				<div
					class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
				>
					<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
					<span class="text-base-content/80 p-4 text-sm sm:text-base"
						>{$_('product.edit.info.basic_info')}</span
					>
					<button
						type="button"
						class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
						aria-label="Close"
						onclick={() => (showInfoBasic = false)}
					>
						<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
					</button>
				</div>
			{/if}
			<!-- Basic Product Information -->
			<div class="space-y-6">
				<!-- Primary Fields Grid -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.quantity')}</span
							></label
						>
						<input
							type="text"
							class="input input-bordered w-full text-sm sm:text-base"
							bind:value={$formProduct.quantity}
							placeholder="e.g., 250g, 1L, 500ml"
						/>
					</div>
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.packaging')}</span
							></label
						>
						<input
							type="text"
							class="input input-bordered w-full text-sm sm:text-base"
							bind:value={$formProduct.packaging}
							placeholder="e.g., plastic bottle, glass jar"
						/>
					</div>
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.manufacturing_places')}</span
							></label
						>
						<input
							type="text"
							class="input input-bordered w-full text-sm sm:text-base"
							bind:value={$formProduct.manufacturing_places}
							placeholder="e.g., France, Italy"
						/>
					</div>
				</div>
				<!-- Secondary Fields Grid -->
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.emb_code')}</span
							></label
						>
						<input
							type="text"
							class="input input-bordered w-full text-sm sm:text-base"
							bind:value={$formProduct.emb_codes}
							placeholder="e.g., EMB 12345"
						/>
					</div>
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.website_url')}</span
							></label
						>
						<input
							type="url"
							class="input input-bordered w-full text-sm sm:text-base"
							bind:value={$formProduct.link}
							placeholder="https://example.com"
						/>
					</div>
				</div>
			</div>
			<!-- Tags Section -->
			<div class="divider my-6">
				<span class="text-sm font-medium opacity-60">Product Tags</span>
			</div>
			<div class="space-y-4">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.categories')}</span
							></label
						>
						<TagsString bind:tagsString={$formProduct.categories} autocomplete={[]} />
					</div>
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.labels')}</span
							></label
						>
						<TagsString bind:tagsString={$formProduct.labels} autocomplete={[]} />
					</div>
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.brands')}</span
							></label
						>
						<TagsString bind:tagsString={$formProduct.brands} autocomplete={[]} />
					</div>
				</div>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.stores')}</span
							></label
						>
						<TagsString bind:tagsString={$formProduct.stores} autocomplete={[]} />
					</div>
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.origins')}</span
							></label
						>
						<TagsString bind:tagsString={$formProduct.origins} autocomplete={[]} />
					</div>
					<div class="form-control w-full">
						<label class="label"
							><span class="label-text text-sm font-medium sm:text-base"
								>{$_('product.edit.countries')}</span
							></label
						>
						<TagsString bind:tagsString={$formProduct.countries} autocomplete={[]} />
					</div>
				</div>
				<div class="form-control w-full">
					<label class="label"
						><span class="label-text text-sm font-medium sm:text-base">Traceability Codes</span
						></label
					>
					<TraceabilityCodes bind:traceabilityCodes={$formProduct.emb_codes} autocomplete={[]} />
				</div>
			</div>
		</div>
	</div>

	<!-- Languages Section -->
	<div class="collapse-arrow bg-base-100 collapse shadow-md">
		<input type="checkbox" />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--translate] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.languages')}
		</div>
		<div class="collapse-content">
			<button
				type="button"
				class="mb-2"
				aria-label="Info"
				onclick={() => (showInfoLanguages = !showInfoLanguages)}
			>
				<span
					class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
				></span>
			</button>
			{#if showInfoLanguages}
				<div
					class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
				>
					<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
					<span class="text-base-content/80 p-4 text-sm sm:text-base"
						>{$_('product.edit.info.languages')}</span
					>
					<button
						type="button"
						class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
						aria-label="Close"
						onclick={() => (showInfoLanguages = false)}
					>
						<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
					</button>
				</div>
			{/if}
			<div class="collapse-arrow bg-base-200 collapse mb-4">
				<input type="checkbox" />
				<div class="collapse-title text-sm font-semibold sm:text-base">
					{$_('product.edit.add_language')}
				</div>
				<div class="collapse-content">
					<label class="input w-full text-sm sm:text-base">
						<span class="icon-[mdi--search] h-5 w-5"></span>
						<input
							type="search"
							placeholder={$_('product.edit.search_languages')}
							bind:value={languageSearch}
							class="text-sm sm:text-base"
						/>
					</label>
					{#if filteredLanguages.length === 0}
						<p class="mt-4 text-center text-sm opacity-70 sm:text-base">
							{$_('product.edit.no_languages_found')}
						</p>
					{:else}
						<div
							class="mt-2 grid max-h-96 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 overflow-auto sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
						>
							{#each filteredLanguages as code (code)}
								<button class="btn btn-ghost text-xs sm:text-sm" onclick={() => addLanguage(code)}
									>{getLanguage(code)}</button
								>
							{/each}
						</div>
					{/if}
				</div>
			</div>
			<div class="tabs tabs-box">
				{#each Object.keys($formProduct.languages_codes ?? {}) as code (code)}
					<input
						type="radio"
						name="name_tabs_edit"
						class="tab text-xs sm:text-sm"
						aria-label={getLanguage(code)}
						checked={code === $formProduct.lang}
					/>
					<div class="tab-content form-control p-6">
						<label class="label text-sm sm:text-base"
							>{$_('product.edit.name')} ({getLanguage(code)})</label
						>
						<input
							type="text"
							class="input input-bordered w-full text-sm sm:text-base"
							bind:value={$formProduct[`product_name_${code}`]}
						/>
					</div>
				{/each}
				{#if Object.keys($formProduct.languages_codes ?? {}).length === 0}
					<div class="alert alert-warning text-sm sm:text-base">
						{$_('product.edit.no_languages_found')}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Ingredients Section -->
	<div class="collapse-arrow bg-base-100 collapse shadow-md">
		<input type="checkbox" />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--format-list-bulleted] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.ingredients')}
		</div>
		<div class="collapse-content">
			<button
				type="button"
				class="mb-2"
				aria-label="Info"
				onclick={() => (showInfoIngredients = !showInfoIngredients)}
			>
				<span
					class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
				></span>
			</button>
			{#if showInfoIngredients}
				<div
					class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
				>
					<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
					<span class="text-base-content/80 p-4 text-sm sm:text-base"
						>{$_('product.edit.info.ingredients')}</span
					>
					<button
						type="button"
						class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
						aria-label="Close"
						onclick={() => (showInfoIngredients = false)}
					>
						<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
					</button>
				</div>
			{/if}
			<div class="tabs tabs-box">
				{#each Object.keys($formProduct.languages_codes ?? {}) as code (code)}
					<input
						type="radio"
						name="ingredients_tabs_edit"
						class="tab text-xs sm:text-sm"
						aria-label={getLanguage(code)}
						checked={code === $formProduct.lang}
					/>
					<div class="tab-content form-control p-6">
						{#if getIngredientsImage(code)}
							<img src={getIngredientsImage(code)} alt="Ingredients" class="mb-4" />
						{:else}
							<p class="alert alert-warning mb-4 text-sm sm:text-base">
								{$_('product.edit.no_ingredients_image')}
							</p>
						{/if}
						<label class="label text-sm sm:text-base"
							>{$_('product.edit.ingredients_list')} ({getLanguage(code)})</label
						>
						<div class="form-control mb-4">
							<textarea
								class="textarea textarea-bordered h-40 w-full text-sm sm:text-base"
								bind:value={$formProduct[`ingredients_text_${code}`]}
							></textarea>
						</div>
					</div>
				{/each}
				{#if Object.keys($formProduct.languages_codes ?? {}).length === 0}
					<div class="alert alert-warning text-sm sm:text-base">
						{$_('product.edit.no_languages_found')}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Nutrition Section -->
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
				{#each Object.keys($formProduct.languages_codes ?? {}) as code (code)}
					<input
						type="radio"
						name="nutrition_image_tabs_edit"
						class="tab text-xs sm:text-sm"
						aria-label={getLanguage(code)}
						checked={code === $formProduct.lang}
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
				{#if Object.keys($formProduct.languages_codes ?? {}).length === 0}
					<div class="alert alert-warning text-sm sm:text-base">
						{$_('product.edit.no_languages_found')}
					</div>
				{/if}
			</div>
			<div class="space-y-6">
				<div class="form-control">
					<label class="label"
						><span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.serving_size')}</span
						></label
					>
					<input
						type="text"
						class="input input-bordered w-full text-sm sm:text-base"
						bind:value={$formProduct.serving_size}
						placeholder="e.g., 100g, 1 serving (30g)"
					/>
				</div>
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input type="checkbox" class="checkbox" bind:checked={$formProduct.no_nutrition_data} />
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.no_nutrition_data')}</span
						>
					</label>
				</div>
				{#if !$formProduct.no_nutrition_data}
					<div class="space-y-6">
						<div class="divider">
							<span class="text-sm font-medium opacity-60">Nutritional Values</span>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div class="form-control">
								<label class="label"
									><span class="label-text text-sm font-medium sm:text-base">Energy (kJ)</span
									></label
								>
								<input
									type="number"
									class="input input-bordered w-full text-sm sm:text-base"
									value={$formProduct.nutriments?.['energy-kj_100g'] ?? ''}
									oninput={(e) => handleNutrimentInput(e, 'energy-kj_100g')}
									placeholder="2100"
									step="1"
									min="0"
								/>
							</div>
							<div class="form-control">
								<label class="label"
									><span class="label-text text-sm font-medium sm:text-base">Energy (kcal)</span
									></label
								>
								<input
									type="number"
									class="input input-bordered w-full text-sm sm:text-base"
									value={$formProduct.nutriments?.['energy-kcal_100g'] ?? ''}
									oninput={(e) => handleNutrimentInput(e, 'energy-kcal_100g')}
									placeholder="500"
									step="1"
									min="0"
								/>
							</div>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<div class="form-control">
								<label class="label"
									><span class="label-text text-sm font-medium sm:text-base">Fat (g)</span></label
								>
								<input
									type="number"
									class="input input-bordered w-full text-sm sm:text-base"
									value={$formProduct.nutriments?.fat_100g ?? ''}
									oninput={(e) => handleNutrimentInput(e, 'fat_100g')}
									placeholder="10.5"
									step="0.1"
									min="0"
								/>
							</div>
							<div class="form-control">
								<label class="label"
									><span class="label-text text-sm font-medium sm:text-base"
										>{$_('product.edit.saturated_fat')}</span
									></label
								>
								<input
									type="number"
									class="input input-bordered w-full text-sm sm:text-base"
									value={$formProduct.nutriments?.['saturated-fat_100g'] ?? ''}
									oninput={(e) => handleNutrimentInput(e, 'saturated-fat_100g')}
									placeholder="3.2"
									step="0.1"
									min="0"
								/>
							</div>
							<div class="form-control">
								<label class="label"
									><span class="label-text text-sm font-medium sm:text-base"
										>{$_('product.edit.carbohydrates')}</span
									></label
								>
								<input
									type="number"
									class="input input-bordered w-full text-sm sm:text-base"
									value={$formProduct.nutriments?.carbohydrates_100g ?? ''}
									oninput={(e) => handleNutrimentInput(e, 'carbohydrates_100g')}
									placeholder="60.0"
									step="0.1"
									min="0"
								/>
							</div>
							<div class="form-control">
								<label class="label"
									><span class="label-text text-sm font-medium sm:text-base"
										>{$_('product.edit.sugars')}</span
									></label
								>
								<input
									type="number"
									class="input input-bordered w-full text-sm sm:text-base"
									value={$formProduct.nutriments?.sugars_100g ?? ''}
									oninput={(e) => handleNutrimentInput(e, 'sugars_100g')}
									placeholder="5.0"
									step="0.1"
									min="0"
								/>
							</div>
						</div>
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div class="form-control">
								<label class="label"
									><span class="label-text text-sm font-medium sm:text-base"
										>{$_('product.edit.proteins')}</span
									></label
								>
								<input
									type="number"
									class="input input-bordered w-full text-sm sm:text-base"
									value={$formProduct.nutriments?.proteins_100g ?? ''}
									oninput={(e) => handleNutrimentInput(e, 'proteins_100g')}
									placeholder="12.0"
									step="0.1"
									min="0"
								/>
							</div>
							<div class="form-control">
								<label class="label"
									><span class="label-text text-sm font-medium sm:text-base"
										>{$_('product.edit.salt')}</span
									></label
								>
								<input
									type="number"
									class="input input-bordered w-full text-sm sm:text-base"
									value={$formProduct.nutriments?.salt_100g ?? ''}
									oninput={(e) => handleNutrimentInput(e, 'salt_100g')}
									placeholder="1.2"
									step="0.01"
									min="0"
								/>
							</div>
							<div class="form-control">
								<label class="label"
									><span class="label-text text-sm font-medium sm:text-base"
										>{$_('product.edit.sodium')}</span
									></label
								>
								<input
									type="number"
									class="input input-bordered w-full text-sm sm:text-base"
									value={$formProduct.nutriments?.sodium_100g ?? ''}
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

	<!-- Comment Section -->
	<div class="collapse-arrow bg-base-100 collapse shadow-md">
		<input type="checkbox" />
		<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
			<span class="icon-[mdi--comment-text] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
			{$_('product.edit.sections.comment')}
		</div>
		<div class="collapse-content">
			<button
				type="button"
				class="mb-2"
				aria-label="Info"
				onclick={() => (showInfoComment = !showInfoComment)}
			>
				<span
					class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
				></span>
			</button>
			{#if showInfoComment}
				<div
					class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
				>
					<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
					<span class="text-base-content/80 p-4 text-sm sm:text-base"
						>Optionally, add a comment to describe your changes or provide additional context.</span
					>
					<button
						type="button"
						class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
						aria-label="Close"
						onclick={() => (showInfoComment = false)}
					>
						<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
					</button>
				</div>
			{/if}
			<div class="form-control">
				<label class="label"
					><span class="label-text text-sm font-medium sm:text-base"
						>{$_('product.edit.comment')}</span
					></label
				>
				<textarea
					id="comment-edit"
					class="textarea textarea-bordered w-full text-sm sm:text-base"
					placeholder={$_('product.edit.comment_placeholder')}
					bind:value={comment}
					rows="3"
				></textarea>
			</div>
		</div>
	</div>

	<div class="mt-8 flex justify-end">
		<button
			class="btn btn-primary w-full text-sm sm:w-auto sm:text-base"
			onclick={handleSubmit}
			type="button"
		>
			{$_('product.edit.save_btn')}
		</button>
	</div>
</div>
