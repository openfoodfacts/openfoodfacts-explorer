<script lang="ts">
	import { writable, get } from 'svelte/store';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';

	import {
		getOrDefault,
		ProductsApi,
		type SelectedImage,
		type Taxonomy,
		type Product,
		type Nutriments,
		type RawImage
	} from '$lib/api';
	import { preferences } from '$lib/settings';
	import Card from '$lib/ui/Card.svelte';

	import type { PageData } from './$types';
	import TagsString from './TagsString.svelte';
	import { PRODUCT_IMAGE_URL, PRODUCT_STATUS } from '$lib/const';
	import TraceabilityCodes from './TraceabilityCodes.svelte';
	import PhotoManager from './PhotoManager.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function createEmptyImage(): SelectedImage | RawImage {
		return {
			url: '',
			sizes: {
				full: { w: 0, h: 0 },
				100: { w: 0, h: 0 },
				400: { w: 0, h: 0 }
			},
			uploaded_t: '',
			uploader: ''
		};
	}

	function createEmptyNutriments(): Nutriments {
		return {
			alcohol: 0,
			alcohol_100g: 0,
			alcohol_serving: 0,
			alcohol_unit: '',
			alcohol_value: 0,
			carbohydrates: 0,
			carbohydrates_100g: 0,
			carbohydrates_serving: 0,
			carbohydrates_unit: '',
			carbohydrates_value: 0,
			energy: 0,
			energy_100g: 0,
			energy_serving: 0,
			energy_unit: '',
			energy_value: 0,
			fat: 0,
			fat_100g: 0,
			fat_serving: 0,
			fat_unit: '',
			fat_value: 0,
			'carbon-footprint-from-known-ingredients_product': 0,
			'carbon-footprint-from-known-ingredients_serving': 0,
			'energy-kcal': 0,
			'energy-kcal_100g': 0,
			'energy-kcal_serving': 0,
			'energy-kcal_unit': '',
			'energy-kcal_value': 0,
			'energy-kj': 0,
			'energy-kj_100g': 0,
			'energy-kj_serving': 0,
			'energy-kj_unit': '',
			'energy-kj_value': 0,
			erythritol: 0,
			erythritol_100g: 0,
			erythritol_serving: 0,
			erythritol_unit: '',
			erythritol_value: 0,
			'fruits-vegetables-nuts-estimate-from-ingredients_100g': 0,
			'fruits-vegetables-nuts-estimate-from-ingredients_serving': 0,
			proteins: 0,
			proteins_100g: 0,
			proteins_serving: 0,
			proteins_unit: '',
			proteins_value: 0,
			sugars: 0,
			sugars_100g: 0,
			sugars_serving: 0,
			sugars_unit: '',
			sugars_value: 0,
			salt: 0,
			salt_100g: 0,
			salt_serving: 0,
			salt_unit: '',
			salt_value: 0,
			'saturated-fat': 0,
			'saturated-fat_100g': 0,
			'saturated-fat_serving': 0,
			'saturated-fat_unit': '',
			'saturated-fat_value': 0,
			sodium: 0,
			sodium_100g: 0,
			sodium_serving: 0,
			sodium_unit: '',
			sodium_value: 0
		};
	}

	const emptyProduct: Product = {
		_id: '',
		code: $page.params.barcode,
		created_t: 0,
		creator: '',
		last_modified_t: 0,
		last_editor: '',

		product_name: '',
		product_name_en: '',
		quantity: '',
		categories: '',
		labels: '',
		brands: '',
		stores: '',
		origins: '',
		countries: '',
		link: '',
		ingredients_text: '',
		ingredients_text_en: '',
		serving_size: '',
		packaging: '',
		manufacturing_places: '',
		product_type: '',

		images: {
			front: createEmptyImage(),
			ingredients: createEmptyImage()
		},

		nutriscore_grade: '',
		nova_group: 0,
		ecoscore_grade: '',

		knowledge_panels: {},
		_keywords: [],
		additives_n: 0,
		ingredients: [],
		additives_tags: [],

		image_front_url: '',
		image_front_small_url: '',
		image_ingredients_url: '',
		image_ingredients_small_url: '',
		image_ingredients_thumb_url: '',
		image_nutrition_url: '',
		image_nutrition_small_url: '',
		image_nutrition_thumb_url: '',

		brands_tags: [],
		categories_tags: [],
		categories_hierarchy: [],
		stores_tags: [],
		labels_tags: [],
		origins_tags: [],
		countries_tags: [],

		nutriments: createEmptyNutriments(),

		source: {
			fields: [],
			id: '',
			images: [],
			import_t: 0,
			manufacturer: '',
			name: '',
			source_licence: '',
			source_licence_url: '',
			url: ''
		},

		languages_codes: { en: 1 },
		lang: 'en',
		emb_codes: '',
		emb_codes_tags: [],
		editors_tags: [],
		last_checked_t: 0,
		checkers_tags: [],
		states_hierarchy: []
	};

	function getNames(taxo: Taxonomy) {
		return Object.values(taxo)
			.map((t) => getOrDefault(t.name, $preferences.lang))
			.filter((t): t is string => t !== undefined);
	}

	function getLanguage(code: string) {
		return ISO6391.getName(code);
	}

	let categoryNames = $derived(getNames(data.categories));
	let labelNames = $derived(getNames(data.labels));
	let brandNames = $derived(getNames(data.brands));
	let storeNames = $derived(getNames(data.stores));
	let originNames = $derived(getNames(data.origins));
	let countriesNames = $derived(getNames(data.countries));

	let productStore = $derived.by(() => {
		if (data.state.status === PRODUCT_STATUS.EMPTY) {
			return writable<Product>(emptyProduct);
		} else if (data.state.product) {
			return writable<Product>({
				...data.state.product,
				emb_codes: data.state.product.emb_codes ?? '',
				categories: data.state.product.categories ?? '',
				labels: data.state.product.labels ?? '',
				brands: data.state.product.brands ?? '',
				stores: data.state.product.stores ?? '',
				origins: data.state.product.origins ?? '',
				countries: data.state.product.countries ?? '',
				languages_codes: data.state.product.languages_codes ?? {},
				images: data.state.product.images ?? {},
				nutriments: data.state.product.nutriments ?? {}
			});
		} else {
			return writable<Product>(emptyProduct);
		}
	});

	let comment = writable('');
	const languageCodes = ISO6391.getAllCodes();
	let languageSearch = $state('');
	let filteredLanguages = $derived(
		languageCodes.filter((code) => {
			if ($productStore.languages_codes[code] !== undefined) {
				return false;
			}
			const language = getLanguage(code);
			return language.toLowerCase().includes(languageSearch.toLowerCase());
		})
	);

	let isSubmitting = $state(false);
	let productNotFound = $derived(data.state.status === 'empty');

	// Initialize nutriments object if it doesn't exist
	function ensureNutriments() {
		productStore.update((store) => {
			if (!store.nutriments) {
				store.nutriments = {} as Nutriments;
			}
			return store;
		});
	}

	// Handle nutriment value changes
	function updateNutriment(key: string, value: number | null) {
		ensureNutriments();
		productStore.update((store) => {
			if (value === null) {
				// @ts-expect-error - We know this is a valid key for nutriments
				delete store.nutriments[key];
			} else {
				// @ts-expect-error - We know this is a valid key for nutriments
				store.nutriments[key] = value;
			}
			return store;
		});
	}

	function handleNutrimentInput(e: Event, key: string) {
		const target = e.currentTarget as HTMLInputElement;
		updateNutriment(key, target.value ? Number(target.value) : null);
	}

	async function submit() {
		isSubmitting = true;
		const product = get(productStore);
		const commentValue = get(comment);

		console.group('Product added/edited');
		console.debug('Submitting', product);

		const ok = await new ProductsApi(fetch).addOrEditProductV2({
			...product,
			comment: commentValue
		});
		console.debug('Submitted', ok);
		console.groupEnd();
		if (ok) {
			window.location.href = '/products/' + product.code;
		} else {
			isSubmitting = false;
		}
	}

	function addLanguage(code: string) {
		productStore.update((store) => {
			store.languages_codes = { ...store.languages_codes, [code]: 0 };
			return store;
		});
	}

	function getIngredientsImage(language: string) {
		const productData = get(productStore);
		if (productData.code == null || productData.images == null) {
			return null;
		}

		const paddedBarcode = productData.code.toString().padStart(13, '0');
		const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
		if (!match) {
			throw new Error('Invalid barcode format');
		}

		const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
		const imageName = 'ingredients_' + language;
		const image = productData.images[imageName];

		if (!image) {
			return null;
		}

		const rev = (image as SelectedImage).rev;
		if (rev == null) {
			return null;
		}

		const filename = `${imageName}.${rev}.400.jpg`;
		return PRODUCT_IMAGE_URL(`${path}/${filename}`);
	}

	function getNutritionImage(language: string) {
		const productData = get(productStore);
		if (productData.code == null || productData.images == null) {
			return null;
		}

		const paddedBarcode = productData.code.toString().padStart(13, '0');
		const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
		if (!match) {
			throw new Error('Invalid barcode format');
		}

		const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
		const imageName = 'nutrition_' + language;
		const image = productData.images[imageName];

		if (!image) {
			return null;
		}

		const rev = (image as SelectedImage).rev;
		if (rev == null) {
			return null;
		}

		const filename = `${imageName}.${rev}.400.jpg`;
		return PRODUCT_IMAGE_URL(`${path}/${filename}`);
	}

	$effect(() => {
		productStore.subscribe((it) => {
			console.debug('Product store changed', it);
		});
	});

	let currentStep = $state(0);
	const steps = $derived([
		$_('product.edit.sections.images'),
		$_('product.edit.sections.basic_info'),
		$_('product.edit.sections.languages'),
		$_('product.edit.sections.ingredients'),
		$_('product.edit.sections.nutrition'),
		$_('product.edit.sections.comment')
	]);

	// Determine if we're in add mode (new product) or edit mode (existing product)
	const isAddMode = $derived(productNotFound);

	// Initialize step from URL parameter for add mode
	$effect(() => {
		if (isAddMode) {
			const stepParam = $page.url.searchParams.get('step');
			if (stepParam) {
				const stepNumber = parseInt(stepParam, 10) - 1; // Convert to 0-based index
				if (stepNumber >= 0 && stepNumber < steps.length) {
					currentStep = stepNumber;
				}
			}
		}
	});

	// Update URL when step changes in add mode
	function updateStepInUrl(step: number) {
		if (isAddMode) {
			const url = new URL($page.url);
			url.searchParams.set('step', (step + 1).toString()); // Convert to 1-based for URL
			goto(url.toString(), { replaceState: true, noScroll: true });
		}
	}

	function goToStep(stepIndex: number) {
		currentStep = stepIndex;
		updateStepInUrl(currentStep);
	}

	function nextStep() {
		if (currentStep < steps.length - 1) {
			currentStep = currentStep + 1;
			updateStepInUrl(currentStep);
		}
	}
	function prevStep() {
		if (currentStep > 0) {
			currentStep = currentStep - 1;
			updateStepInUrl(currentStep);
		}
	}
</script>

<div class="space-y-8">
	<!-- Super Title -->
	<div class="text-center mb-8 space-y-2">
		<h1 class="text-2xl sm:text-3xl font-semibold text-primary tracking-wide">
			{#if isAddMode}
				{$_('product.edit.add_product_title')}
			{:else}
				{$_('product.edit.edit_product_title')}
			{/if}
		</h1>
		<div class="h-px w-16 bg-primary/20 mx-auto"></div>
		<p class="text-base sm:text-lg text-base-content/60 font-mono tracking-wider">
			{#if $productStore.product_name}
				{$productStore.product_name}
			{:else if $productStore.product_name_en}
				{$productStore.product_name_en}
			{:else}
				{$page.params.barcode}
			{/if}
		</p>
	</div>

	{#if isAddMode}
		<!-- ADD MODE: Step-by-step guided form -->
		<div class="block md:hidden mb-6">
			<div class="text-center space-y-2">
				<div class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
					<span class="text-xs font-medium text-primary/80">
						{$_('common.step')} {currentStep + 1}
					</span>
					<div class="w-1 h-1 bg-primary/40 rounded-full"></div>
					<span class="text-xs font-medium text-primary/60">
						{$_('common.of')} {steps.length}
					</span>
				</div>
				<h2 class="text-xl font-semibold text-base-content leading-tight px-4">
					{steps[currentStep]}
				</h2>
			</div>
		</div>

		<div class="hidden md:block mb-6">
			<ul class="steps w-full text-xs sm:text-sm">
				{#each steps as step, i}
					<li class="step {i <= currentStep ? 'step-primary' : ''}">
						<button
							type="button"
							class="w-full h-full p-2 bg-transparent border-none cursor-pointer transition-colors text-inherit text-xs sm:text-sm"
							onclick={() => goToStep(i)}
							aria-label="Go to step {i + 1}: {step}"
						>
							{step}
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Step 1: Images -->
		{#if currentStep === 0}
			<div class="card bg-base-100 shadow-md">
				<div class="card-body p-4 sm:p-6">
			   <h2 class="hidden md:block text-center text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-primary mb-6 flex items-center justify-center gap-2">
				   <span class="icon-[mdi--image-multiple] h-5 w-5 align-middle mr-2"></span>{$_('product.edit.sections.images')}
			   </h2>
					
					<!-- Top Navigation -->
					<div class="flex justify-between items-center mb-6">
						<div>
							{#if currentStep > 0}
								<button class="btn btn-circle btn-sm btn-outline" onclick={prevStep} type="button" title={$_('common.back')}>
									<span class="icon-[mdi--arrow-left] w-4 h-4"></span>
								</button>
							{/if}
						</div>
						<div>
							{#if currentStep < steps.length - 1}
								<button class="btn btn-circle btn-sm btn-primary" onclick={nextStep} type="button" title={$_('common.next')}>
									<span class="icon-[mdi--arrow-right] w-4 h-4"></span>
								</button>
							{:else}
								<button
									class="btn btn-circle btn-sm btn-primary"
									onclick={submit}
									disabled={isSubmitting}
									type="button"
									title={$_('product.edit.add_product')}
								>
									{#if isSubmitting}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<span class="icon-[mdi--check] w-4 h-4"></span>
									{/if}
								</button>
							{/if}
						</div>
					</div>
					
					<PhotoManager product={$productStore} />
				</div>
			</div>
		{/if}

		<!-- Step 2: Basic Info -->
		{#if currentStep === 1}
			<div class="card bg-base-100 shadow-md">
				<div class="card-body p-4 sm:p-6">
			   <h2 class="hidden md:block text-center text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-primary mb-6 flex items-center justify-center gap-2">
				   <span class="icon-[mdi--information] h-5 w-5 align-middle mr-2"></span>{$_('product.edit.sections.basic_info')}
			   </h2>
					
					<!-- Top Navigation -->
					<div class="flex justify-between items-center mb-6">
						<div>
							{#if currentStep > 0}
								<button class="btn btn-circle btn-sm btn-outline" onclick={prevStep} type="button" title={$_('common.back')}>
									<span class="icon-[mdi--arrow-left] w-4 h-4"></span>
								</button>
							{/if}
						</div>
						<div>
							{#if currentStep < steps.length - 1}
								<button class="btn btn-circle btn-sm btn-primary" onclick={nextStep} type="button" title={$_('common.next')}>
									<span class="icon-[mdi--arrow-right] w-4 h-4"></span>
								</button>
							{:else}
								<button
									class="btn btn-circle btn-sm btn-primary"
									onclick={submit}
									disabled={isSubmitting}
									type="button"
									title={$_('product.edit.add_product')}
								>
									{#if isSubmitting}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<span class="icon-[mdi--check] w-4 h-4"></span>
									{/if}
								</button>
							{/if}
						</div>
					</div>
					
					<div class="space-y-6 overflow-hidden">
						<!-- Primary Fields Grid -->
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.quantity')}</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore.quantity}
									placeholder="e.g., 250g, 1L, 500ml"
								/>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.packaging')}</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore.packaging}
									placeholder="e.g., plastic bottle, glass jar"
								/>
							</div>
						</div>

						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.manufacturing_places')}</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore.manufacturing_places}
									placeholder="e.g., France, Italy"
								/>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.emb_code')}</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore.emb_codes}
									placeholder="e.g., EMB 12345"
								/>
							</div>
						</div>

						<div class="form-control w-full">
							<label class="label">
								<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.website_url')}</span>
							</label>
							<input 
								type="url" 
								class="input input-bordered w-full text-sm sm:text-base" 
								bind:value={$productStore.link}
								placeholder="https://example.com"
							/>
						</div>

						<!-- Tags Section -->
						<div class="divider">
							<span class="text-sm font-medium opacity-60">Product Tags</span>
						</div>

						<div class="space-y-4">
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.categories')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.categories} autocomplete={categoryNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.labels')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.labels} autocomplete={labelNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.brands')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.brands} autocomplete={brandNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.stores')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.stores} autocomplete={storeNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.origins')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.origins} autocomplete={originNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.countries')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.countries} autocomplete={countriesNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">Traceability Codes</span>
								</label>
								<div class="w-full">
									<TraceabilityCodes bind:traceabilityCodes={$productStore.emb_codes} autocomplete={[]} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Step 3: Languages -->
		{#if currentStep === 2}
			<div class="card bg-base-100 shadow-md">
				<div class="card-body p-4 sm:p-6">
			   <h2 class="hidden md:block text-center text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-primary mb-6 flex items-center justify-center gap-2">
				   <span class="icon-[mdi--translate] h-5 w-5 align-middle mr-2"></span>{$_('product.edit.sections.languages')}
			   </h2>
					
					<!-- Top Navigation -->
					<div class="flex justify-between items-center mb-6">
						<div>
							{#if currentStep > 0}
								<button class="btn btn-circle btn-sm btn-outline" onclick={prevStep} type="button" title={$_('common.back')}>
									<span class="icon-[mdi--arrow-left] w-4 h-4"></span>
								</button>
							{/if}
						</div>
						<div>
							{#if currentStep < steps.length - 1}
								<button class="btn btn-circle btn-sm btn-primary" onclick={nextStep} type="button" title={$_('common.next')}>
									<span class="icon-[mdi--arrow-right] w-4 h-4"></span>
								</button>
							{:else}
								<button
									class="btn btn-circle btn-sm btn-primary"
									onclick={submit}
									disabled={isSubmitting}
									type="button"
									title={$_('product.edit.add_product')}
								>
									{#if isSubmitting}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<span class="icon-[mdi--check] w-4 h-4"></span>
									{/if}
								</button>
							{/if}
						</div>
					</div>
					
					<div class="collapse-arrow bg-base-200 collapse">
						<input type="checkbox" />
						<div class="collapse-title font-semibold text-sm sm:text-base">{$_('product.edit.add_language')}</div>
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
								<p class="mt-4 text-center opacity-70 text-sm sm:text-base">{$_('product.edit.no_languages_found')}</p>
							{:else}
								<div
									class="mt-2 grid max-h-96 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 overflow-auto"
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
					<div class="tabs tabs-box mt-4">
						{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
							<input
								type="radio"
								name="name_tabs"
								class="tab text-xs sm:text-sm"
								aria-label={getLanguage(code)}
								defaultChecked={code === $productStore.lang}
							/>
							<div class="tab-content form-control p-6">
								<label class="label text-sm sm:text-base">{$_('product.edit.name')} ({getLanguage(code)})</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore[`product_name_${code}`]}
								/>
							</div>
						{/each}
						{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
							<div class="alert alert-warning text-sm sm:text-base">{$_('product.edit.no_languages_found')}</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Step 4: Ingredients -->
		{#if currentStep === 3}
			<div class="card bg-base-100 shadow-md">
				<div class="card-body p-4 sm:p-6">
			   <h2 class="hidden md:block text-center text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-primary mb-6 flex items-center justify-center gap-2">
				   <span class="icon-[mdi--format-list-bulleted] h-5 w-5 align-middle mr-2"></span>{$_('product.edit.sections.ingredients')}
			   </h2>
					
					<!-- Top Navigation -->
					<div class="flex justify-between items-center mb-6">
						<div>
							{#if currentStep > 0}
								<button class="btn btn-circle btn-sm btn-outline" onclick={prevStep} type="button" title={$_('common.back')}>
									<span class="icon-[mdi--arrow-left] w-4 h-4"></span>
								</button>
							{/if}
						</div>
						<div>
							{#if currentStep < steps.length - 1}
								<button class="btn btn-circle btn-sm btn-primary" onclick={nextStep} type="button" title={$_('common.next')}>
									<span class="icon-[mdi--arrow-right] w-4 h-4"></span>
								</button>
							{:else}
								<button
									class="btn btn-circle btn-sm btn-primary"
									onclick={submit}
									disabled={isSubmitting}
									type="button"
									title={$_('product.edit.add_product')}
								>
									{#if isSubmitting}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<span class="icon-[mdi--check] w-4 h-4"></span>
									{/if}
								</button>
							{/if}
						</div>
					</div>
					
					<div class="tabs tabs-box">
						{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
							<input
								type="radio"
								name="ingredients_tabs"
								class="tab text-xs sm:text-sm"
								aria-label={getLanguage(code)}
								defaultChecked={code === $productStore.lang}
							/>
							<div class="tab-content form-control p-6">
								{#if getIngredientsImage(code)}
									<img src={getIngredientsImage(code)} alt="Ingredients" class="mb-4" />
								{:else}
									<p class="alert alert-warning mb-4 text-sm sm:text-base">{$_('product.edit.no_ingredients_image')}</p>
								{/if}
								<label class="label text-sm sm:text-base"
									>{$_('product.edit.ingredients_list')} ({getLanguage(code)})</label
								>
								<div class="form-control mb-4">
									<textarea
										class="textarea textarea-bordered h-40 w-full text-sm sm:text-base"
										bind:value={$productStore[`ingredients_text_${code}`]}
									></textarea>
								</div>
							</div>
						{/each}
						{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
							<div class="alert alert-warning text-sm sm:text-base">{$_('product.edit.no_languages_found')}</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Step 5: Nutrition -->
		{#if currentStep === 4}
			<div class="card bg-base-100 shadow-md">
				<div class="card-body p-4 sm:p-6">
			   <h2 class="hidden md:block text-center text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-primary mb-6 flex items-center justify-center gap-2">
				   <span class="icon-[mdi--nutrition] h-5 w-5 align-middle mr-2"></span>{$_('product.edit.sections.nutrition')}
			   </h2>
					
					<!-- Top Navigation -->
					<div class="flex justify-between items-center mb-6">
						<div>
							{#if currentStep > 0}
								<button class="btn btn-circle btn-sm btn-outline" onclick={prevStep} type="button" title={$_('common.back')}>
									<span class="icon-[mdi--arrow-left] w-4 h-4"></span>
								</button>
							{/if}
						</div>
						<div>
							{#if currentStep < steps.length - 1}
								<button class="btn btn-circle btn-sm btn-primary" onclick={nextStep} type="button" title={$_('common.next')}>
									<span class="icon-[mdi--arrow-right] w-4 h-4"></span>
								</button>
							{:else}
								<button
									class="btn btn-circle btn-sm btn-primary"
									onclick={submit}
									disabled={isSubmitting}
									type="button"
									title={$_('product.edit.add_product')}
								>
									{#if isSubmitting}
										<span class="loading loading-spinner loading-xs"></span>
									{:else}
										<span class="icon-[mdi--check] w-4 h-4"></span>
									{/if}
								</button>
							{/if}
						</div>
					</div>
					
					<div class="tabs tabs-box mb-4">
						{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
							<input
								type="radio"
								name="nutrition_image_tabs"
								class="tab text-xs sm:text-sm"
								aria-label={getLanguage(code)}
								defaultChecked={code === $productStore.lang}
							/>
							<div class="tab-content p-6">
								{#if getNutritionImage(code)}
									<img src={getNutritionImage(code)} alt="Nutrition facts for {getLanguage(code)}" class="mb-4 max-w-full h-auto" />
								{:else}
									<p class="alert alert-warning mb-4 text-sm sm:text-base">{$_('product.edit.no_nutrition_image')}</p>
								{/if}
							</div>
						{/each}
						{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
							<div class="alert alert-warning text-sm sm:text-base">{$_('product.edit.no_languages_found')}</div>
						{/if}
					</div>
					
					<div class="space-y-6">
						<div class="form-control">
							<label class="label">
								<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.serving_size')}</span>
							</label>
							<input
								type="text"
								class="input input-bordered w-full text-sm sm:text-base"
								bind:value={$productStore.serving_size}
								placeholder="e.g., 100g, 1 serving (30g)"
							/>
						</div>
						
						<div class="form-control">
							<label class="label cursor-pointer justify-start gap-3">
								<input
									type="checkbox"
									class="checkbox"
									bind:checked={$productStore.no_nutrition_data}
								/>
								<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.no_nutrition_data')}</span>
							</label>
						</div>
						
						{#if !$productStore.no_nutrition_data}
							<div class="space-y-6">
								<div class="divider">
									<span class="text-sm font-medium opacity-60">Nutritional Values</span>
								</div>
								
								<!-- Energy -->
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div class="form-control">
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Energy (kJ)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Energy (kcal)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Fat (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Saturated Fat (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Carbohydrates (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Sugars (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Proteins (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Salt (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Sodium (g)</span>
										</label>
										<input
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
		{/if}

		<!-- Step 6: Comment -->
		{#if currentStep === 5}
			<div class="card bg-base-100 shadow-md">
				<div class="card-body p-4 sm:p-6">
			   <h2 class="hidden md:block text-center text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-primary mb-6 flex items-center justify-center gap-2">
				   <span class="icon-[mdi--comment-text] h-5 w-5 align-middle mr-2"></span>{$_('product.edit.sections.comment')}
			   </h2>
					
					<!-- Top Navigation -->
					<div class="flex justify-between items-center mb-6">
						<div>
							{#if currentStep > 0}
								<button class="btn btn-circle btn-sm btn-outline" onclick={prevStep} type="button" title={$_('common.back')}>
									<span class="icon-[mdi--arrow-left] w-4 h-4"></span>
								</button>
							{/if}
						</div>
					</div>
					
					<div class="space-y-6">
						<div class="text-center mb-6">
							<p class="text-sm text-base-content/60">
								Add a comment about your changes (optional)
							</p>
						</div>
						
						<div class="form-control">
							<label class="label">
								<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.comment')}</span>
							</label>
							<textarea
								id="comment"
								class="textarea textarea-bordered w-full text-sm sm:text-base"
								placeholder={$_('product.edit.comment_placeholder')}
								bind:value={$comment}
								rows="3"
							></textarea>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Navigation Buttons for Add Mode -->
		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex">
				{#if currentStep > 0}
					<button class="btn btn-outline w-full sm:w-auto text-sm sm:text-base" onclick={prevStep} type="button">
						<span class="icon-[mdi--arrow-left] mr-2"></span>{$_('common.back')}
					</button>
				{/if}
			</div>
			
			<div class="flex">
				{#if currentStep < steps.length - 1}
					<button class="btn btn-primary w-full sm:w-auto text-sm sm:text-base" onclick={nextStep} type="button">
						{$_('common.next')}<span class="icon-[mdi--arrow-right] ml-2"></span>
					</button>
				{:else}
					<button
						class="btn btn-primary w-full sm:w-auto text-sm sm:text-base"
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
		</div>
	{:else}
		<!-- EDIT MODE: Single page form with collapsible sections -->
		<div class="space-y-4">
			<!-- Images Section -->
			<div class="collapse collapse-arrow bg-base-100 shadow-md">
				<input type="checkbox" />
				<div class="collapse-title text-sm sm:text-base font-bold flex items-center">
					<span class="icon-[mdi--image-multiple] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>{$_('product.edit.sections.images')}
				</div>
				<div class="collapse-content">
					<PhotoManager product={$productStore} />
				</div>
			</div>

			<!-- Basic Info Section -->
			<div class="collapse collapse-arrow bg-base-100 shadow-md">
				<input type="checkbox" />
				<div class="collapse-title text-sm sm:text-base font-bold flex items-center">
					<span class="icon-[mdi--information] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>{$_('product.edit.sections.basic_info')}
				</div>
				<div class="collapse-content overflow-hidden">
					<!-- Basic Product Information -->
					<div class="space-y-6">
						<!-- Primary Fields Grid -->
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.quantity')}</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore.quantity}
									placeholder="e.g., 250g, 1L, 500ml"
								/>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.packaging')}</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore.packaging}
									placeholder="e.g., plastic bottle, glass jar"
								/>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.manufacturing_places')}</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore.manufacturing_places}
									placeholder="e.g., France, Italy"
								/>
							</div>
						</div>

						<!-- Secondary Fields Grid -->
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.emb_code')}</span>
								</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore.emb_codes}
									placeholder="e.g., EMB 12345"
								/>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.website_url')}</span>
								</label>
								<input 
									type="url" 
									class="input input-bordered w-full text-sm sm:text-base" 
									bind:value={$productStore.link}
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
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.categories')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.categories} autocomplete={categoryNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.labels')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.labels} autocomplete={labelNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.brands')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.brands} autocomplete={brandNames} />
								</div>
							</div>
						</div>
						
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.stores')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.stores} autocomplete={storeNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.origins')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.origins} autocomplete={originNames} />
								</div>
							</div>
							<div class="form-control w-full">
								<label class="label">
									<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.countries')}</span>
								</label>
								<div class="w-full">
									<TagsString bind:tagsString={$productStore.countries} autocomplete={countriesNames} />
								</div>
							</div>
						</div>
						
						<div class="form-control w-full">
							<label class="label">
								<span class="label-text text-sm sm:text-base font-medium">Traceability Codes</span>
							</label>
							<div class="w-full">
								<TraceabilityCodes bind:traceabilityCodes={$productStore.emb_codes} autocomplete={[]} />
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Languages Section -->
			<div class="collapse collapse-arrow bg-base-100 shadow-md">
				<input type="checkbox" />
				<div class="collapse-title text-sm sm:text-base font-bold flex items-center">
					<span class="icon-[mdi--translate] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>{$_('product.edit.sections.languages')}
				</div>
				<div class="collapse-content">
					<div class="collapse-arrow bg-base-200 collapse mb-4">
						<input type="checkbox" />
						<div class="collapse-title font-semibold text-sm sm:text-base">{$_('product.edit.add_language')}</div>
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
								<p class="mt-4 text-center opacity-70 text-sm sm:text-base">{$_('product.edit.no_languages_found')}</p>
							{:else}
								<div
									class="mt-2 grid max-h-96 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 overflow-auto"
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
						{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
							<input
								type="radio"
								name="name_tabs_edit"
								class="tab text-xs sm:text-sm"
								aria-label={getLanguage(code)}
								defaultChecked={code === $productStore.lang}
							/>
							<div class="tab-content form-control p-6">
								<label class="label text-sm sm:text-base">{$_('product.edit.name')} ({getLanguage(code)})</label>
								<input
									type="text"
									class="input input-bordered w-full text-sm sm:text-base"
									bind:value={$productStore[`product_name_${code}`]}
								/>
							</div>
						{/each}
						{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
							<div class="alert alert-warning text-sm sm:text-base">{$_('product.edit.no_languages_found')}</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Ingredients Section -->
			<div class="collapse collapse-arrow bg-base-100 shadow-md">
				<input type="checkbox" />
				<div class="collapse-title text-sm sm:text-base font-bold flex items-center">
					<span class="icon-[mdi--format-list-bulleted] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>{$_('product.edit.sections.ingredients')}
				</div>
				<div class="collapse-content">
					<div class="tabs tabs-box">
						{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
							<input
								type="radio"
								name="ingredients_tabs_edit"
								class="tab text-xs sm:text-sm"
								aria-label={getLanguage(code)}
								defaultChecked={code === $productStore.lang}
							/>
							<div class="tab-content form-control p-6">
								{#if getIngredientsImage(code)}
									<img src={getIngredientsImage(code)} alt="Ingredients" class="mb-4" />
								{:else}
									<p class="alert alert-warning mb-4 text-sm sm:text-base">{$_('product.edit.no_ingredients_image')}</p>
								{/if}
								<label class="label text-sm sm:text-base"
									>{$_('product.edit.ingredients_list')} ({getLanguage(code)})</label
								>
								<div class="form-control mb-4">
									<textarea
										class="textarea textarea-bordered h-40 w-full text-sm sm:text-base"
										bind:value={$productStore[`ingredients_text_${code}`]}
									></textarea>
								</div>
							</div>
						{/each}
						{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
							<div class="alert alert-warning text-sm sm:text-base">{$_('product.edit.no_languages_found')}</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Nutrition Section -->
			<div class="collapse collapse-arrow bg-base-100 shadow-md">
				<input type="checkbox" />
				<div class="collapse-title text-sm sm:text-base font-bold flex items-center">
					<span class="icon-[mdi--nutrition] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>{$_('product.edit.sections.nutrition')}
				</div>
				<div class="collapse-content">
					<div class="tabs tabs-box mb-4">
						{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
							<input
								type="radio"
								name="nutrition_image_tabs_edit"
								class="tab text-xs sm:text-sm"
								aria-label={getLanguage(code)}
								defaultChecked={code === $productStore.lang}
							/>
							<div class="tab-content p-6">
								{#if getNutritionImage(code)}
									<img src={getNutritionImage(code)} alt="Nutrition facts for {getLanguage(code)}" class="mb-4 max-w-full h-auto" />
								{:else}
									<p class="alert alert-warning mb-4 text-sm sm:text-base">{$_('product.edit.no_nutrition_image')}</p>
								{/if}
							</div>
						{/each}
						{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
							<div class="alert alert-warning text-sm sm:text-base">{$_('product.edit.no_languages_found')}</div>
						{/if}
					</div>
					
					<div class="space-y-6">
						<div class="form-control">
							<label class="label">
								<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.serving_size')}</span>
							</label>
							<input
								type="text"
								class="input input-bordered w-full text-sm sm:text-base"
								bind:value={$productStore.serving_size}
								placeholder="e.g., 100g, 1 serving (30g)"
							/>
						</div>
						
						<div class="form-control">
							<label class="label cursor-pointer justify-start gap-3">
								<input
									type="checkbox"
									class="checkbox"
									bind:checked={$productStore.no_nutrition_data}
								/>
								<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.no_nutrition_data')}</span>
							</label>
						</div>
						
						{#if !$productStore.no_nutrition_data}
							<div class="space-y-6">
								<div class="divider">
									<span class="text-sm font-medium opacity-60">Nutritional Values</span>
								</div>
								
								<!-- Energy -->
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div class="form-control">
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Energy (kJ)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Energy (kcal)</span>
										</label>
										<input
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
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
									<div class="form-control">
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Fat (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Saturated Fat (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Carbohydrates (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Sugars (g)</span>
										</label>
										<input
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

								<!-- Proteins and Salt -->
								<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
									<div class="form-control">
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Proteins (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Salt (g)</span>
										</label>
										<input
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
										<label class="label">
											<span class="label-text text-sm sm:text-base font-medium">Sodium (g)</span>
										</label>
										<input
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

			<!-- Comment Section -->
			<div class="collapse collapse-arrow bg-base-100 shadow-md">
				<input type="checkbox" />
				<div class="collapse-title text-sm sm:text-base font-bold flex items-center">
					<span class="icon-[mdi--comment-text] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>{$_('product.edit.sections.comment')}
				</div>
				<div class="collapse-content">
					<div class="form-control">
						<label class="label">
							<span class="label-text text-sm sm:text-base font-medium">{$_('product.edit.comment')}</span>
						</label>
						<textarea
							id="comment-edit"
							class="textarea textarea-bordered w-full text-sm sm:text-base"
							placeholder={$_('product.edit.comment_placeholder')}
							bind:value={$comment}
							rows="3"
						></textarea>
					</div>
				</div>
			</div>

			<div class="mt-8 flex justify-end">
				<button
					class="btn btn-primary w-full sm:w-auto text-sm sm:text-base"
					onclick={submit}
					disabled={isSubmitting}
					type="button"
				>
					{#if isSubmitting}
						<span class="loading loading-spinner loading-sm mr-2"></span>
					{/if}
					{$_('product.edit.save_btn')}
				</button>
			</div>
		</div>
	{/if}
</div>

<details class="mt-8">
	<summary class="text-sm sm:text-base cursor-pointer">{$_('product.edit.debug')}</summary>
	<pre class="text-xs sm:text-sm overflow-auto">{JSON.stringify(data, null, 2)}</pre>
</details>
