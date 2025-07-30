<script lang="ts">
	import { writable, get, type Writable } from 'svelte/store';
	import { page } from '$app/stores';
	import { pushState, replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
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
	import EditProductForm from '$lib/ui/EditProductForm.svelte';
	import AddProductForm from '$lib/ui/AddProductForm.svelte';

	import type { PageData } from './$types';
	import { PRODUCT_IMAGE_URL, PRODUCT_STATUS } from '$lib/const';

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

	function createProductStore(data: PageData): Writable<Product> {
		return data.state.status === PRODUCT_STATUS.EMPTY
			? writable<Product>(emptyProduct)
			: data.state.product
				? writable<Product>({
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
					})
				: writable<Product>(emptyProduct);
	}

	let productStore = $derived(createProductStore(data));

	let comment = $state('');

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
		const commentValue = comment;

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

	// Track if router is ready
	let routerReady = $state(false);

	onMount(() => {
		routerReady = true;
	});

	$effect(() => {
		if (!isAddMode) return;

		if ($page.state && typeof $page.state.currentStep === 'number') {
			currentStep = $page.state.currentStep;
		} else {
			// Fallback to URL parameter for initial load or direct navigation
			const stepParam = $page.url.searchParams.get('step');
			if (stepParam) {
				const stepNumber = parseInt(stepParam, 10) - 1;
				if (stepNumber >= 0 && stepNumber < steps.length) {
					currentStep = stepNumber;
				}
			}

			// Set initial state for shallow routing if router is ready
			if (routerReady) {
				try {
					const searchParams = new URLSearchParams($page.url.searchParams);
					searchParams.set('step', (currentStep + 1).toString());
					replaceState('?' + searchParams.toString(), { currentStep });
				} catch (error) {
					console.warn('Could not set initial state:', error);
				}
			}
		}
	});

	function updateStep(newStep: number) {
		if (!isAddMode || !routerReady) return;

		currentStep = newStep;
		try {
			const searchParams = new URLSearchParams($page.url.searchParams);
			searchParams.set('step', (newStep + 1).toString());
			pushState('?' + searchParams.toString(), { currentStep: newStep });
		} catch (error) {
			console.warn('Could not push state:', error);
		}
	}

	function goToStep(stepIndex: number) {
		if (stepIndex >= 0 && stepIndex < steps.length) {
			updateStep(stepIndex);
		}
	}

	function nextStep() {
		if (currentStep < steps.length - 1) {
			updateStep(currentStep + 1);
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			updateStep(currentStep - 1);
		}
	}

	// Info box visibility states for each section
	let showInfoImages = $state(false);
	let showInfoBasic = $state(false);
	let showInfoLanguages = $state(false);
	let showInfoIngredients = $state(false);
	let showInfoNutrition = $state(false);
	let showInfoComment = $state(false);

	// Toggle functions for info boxes
	function toggleInfoImages() {
		showInfoImages = !showInfoImages;
	}

	function toggleInfoBasic() {
		showInfoBasic = !showInfoBasic;
	}

	function toggleInfoLanguages() {
		showInfoLanguages = !showInfoLanguages;
	}

	function toggleInfoIngredients() {
		showInfoIngredients = !showInfoIngredients;
	}

	function toggleInfoNutrition() {
		showInfoNutrition = !showInfoNutrition;
	}

	function toggleInfoComment() {
		showInfoComment = !showInfoComment;
	}

	function handleCommentChange(value: string) {
		comment = value;
	}

	let addProductFormProps = $derived({
		productStore,
		comment,
		currentStep,
		steps,
		showInfoImages,
		showInfoBasic,
		showInfoLanguages,
		showInfoIngredients,
		showInfoNutrition,
		showInfoComment,
		prevStep,
		nextStep,
		goToStep,
		handleNutrimentInput,
		addLanguage,
		getLanguage,
		getIngredientsImage,
		getNutritionImage,
		filteredLanguages,
		categoryNames,
		labelNames,
		brandNames,
		storeNames,
		originNames,
		countriesNames,
		isSubmitting,
		submit,
		toggleInfoImages,
		toggleInfoBasic,
		toggleInfoLanguages,
		toggleInfoIngredients,
		toggleInfoNutrition,
		toggleInfoComment,
		handleCommentChange
	});
</script>

<div class="space-y-8">
	<!-- Super Title -->
	<div class="mb-8 space-y-2 text-center">
		<h1 class="text-primary text-2xl font-semibold tracking-wide sm:text-3xl">
			{#if isAddMode}
				{$_('product.edit.add_product_title')}
			{:else}
				{$_('product.edit.edit_product_title')}
			{/if}
		</h1>
		<div class="bg-primary/20 mx-auto h-px w-16"></div>
		<p class="text-base-content/60 font-mono text-base tracking-wider sm:text-lg">
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
		<AddProductForm props={addProductFormProps} />
	{:else}
		<EditProductForm {productStore} onSave={submit} />
	{/if}
</div>

<details class="mt-8">
	<summary class="cursor-pointer text-sm sm:text-base">{$_('product.edit.debug')}</summary>
	<pre class="overflow-auto text-xs sm:text-sm">{JSON.stringify(data, null, 2)}</pre>
</details>
