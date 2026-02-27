<script lang="ts">
	import { goto } from '$app/navigation';
	import ISO6391 from 'iso-639-1';
	import { _ } from '$lib/i18n';

	import {
		getOrDefault,
		type SelectedImage,
		type Taxonomy,
		type Product,
		type Nutriments,
		type RawImage,
		addOrEditProductV2
	} from '$lib/api';
	import { preferences } from '$lib/settings';
	import EditProductForm from '$lib/ui/EditProductForm.svelte';
	import AddProductForm from '$lib/ui/AddProductForm.svelte';

	import type { PageData } from './$types';
	import { PRODUCT_IMAGE_URL, PRODUCT_STATUS } from '$lib/const';
	import { getLanguageName } from '$lib/languages';
	import { page } from '$app/state';
	import { dev } from '$app/environment';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';

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
			uploaded_t: 0,
			uploader: ''
		};
	}

	let emptyProduct: Product = $derived.by(() => {
		const code = page.params.barcode;
		if (!code || code.length < 1) {
			throw new Error('Barcode is required to create an empty product');
		}

		return {
			_id: '',
			code: code,
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

			nutriments: {} as Nutriments,

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
	});

	function getNames(taxo: Taxonomy) {
		return Object.values(taxo)
			.map((t) => getOrDefault(t.name, $preferences.lang))
			.filter((t): t is string => t !== undefined);
	}

	let categoryNames = $derived(getNames(data.categories));
	let labelNames = $derived(getNames(data.labels));
	let brandNames = $derived(getNames(data.brands));
	let storeNames = $derived(getNames(data.stores));
	let originNames = $derived(getNames(data.origins));
	let countriesNames = $derived(getNames(data.countries));

	function createProductStore(data: PageData): Product {
		return data.state.status === PRODUCT_STATUS.EMPTY || !data.state.product
			? emptyProduct
			: {
					...data.state.product,
					emb_codes: data.state.product.emb_codes ?? '',
					categories: data.state.product.categories ?? '',
					labels: data.state.product.labels ?? '',
					brands: data.state.product.brands ?? '',
					stores: data.state.product.stores ?? '',
					origins: data.state.product.origins ?? '',
					countries: data.state.product.countries ?? '',
					languages_codes: data.state.product.languages_codes ?? {},
					// @ts-expect-error - FIXME: to be fixed in the SDK
					images: data.state.product.images ?? {},
					// @ts-expect-error - FIXME: to be fixed in the SDK
					nutriments: data.state.product.nutriments ?? {}
				};
	}

	let product = $derived(createProductStore(data));

	let comment = $state('');

	const languageCodes = ISO6391.getAllCodes();
	let languageSearch = $state('');

	let filteredLanguages = $derived(
		languageCodes.filter((code) => {
			if (product.languages_codes[code] !== undefined) {
				return false;
			}
			const language = getLanguageName(code);
			return language.toLowerCase().includes(languageSearch.toLowerCase());
		})
	);

	let isSubmitting = $state(false);
	let productNotFound = $derived(data.state.status === 'empty');

	// Initialize nutriments object if it doesn't exist
	function ensureNutriments() {
		if (!product.nutriments) {
			product.nutriments = {} as Nutriments;
		}
	}

	// Handle nutriment value changes
	function updateNutriment(key: string, value: number | null) {
		ensureNutriments();

		if (value === null) {
			delete product.nutriments[key];
			product = { ...product, nutriments: { ...product.nutriments } }; // Trigger reactivity
		} else {
			product = {
				...product,
				nutriments: { ...product.nutriments, [key]: value }
			};
		}
	}

	function handleNutrimentInput(e: Event, key: string) {
		const target = e.currentTarget as HTMLInputElement;
		updateNutriment(key, target.value ? Number(target.value) : null);
	}

	async function submit() {
		isSubmitting = true;
		const commentValue = comment;

		console.group('Product added/edited');
		console.debug('Submitting', product);
		const submittedOk = await addOrEditProductV2(fetch, { ...product, comment: commentValue });
		console.debug('Submitted succesfully: ', submittedOk);
		console.groupEnd();

		if (!submittedOk) {
			isSubmitting = false;
			return;
		}

		goto('/products/' + product.code, {
			state: { currentStep: 0 }
		});
	}

	function addLanguage(code: string) {
		product = {
			...product,
			languages_codes: { ...product.languages_codes, [code]: 0 }
		};
	}

	function getIngredientsImage(language: string) {
		const productData = product;
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
		const productData = product;
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

	// Determine if we're in add mode (new product) or edit mode (existing product)
	const isAddMode = $derived(productNotFound);
</script>

{#if dev}
	<div class="alert alert-warning my-8 text-lg" role="alert">
		<IconMdiAlert class="mr-2" />
		<div>
			<p>
				<strong> You are not logged in! </strong>
				This means that the product will not be saved to the database.
			</p>
			<p class="text-sm">
				We allow opening this page because you're in development mode, but the submit button will
				not work.
			</p>
		</div>
	</div>
{/if}

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
			{#if product.product_name}
				{product.product_name}
			{:else if product.product_name_en}
				{product.product_name_en}
			{:else}
				{page.params.barcode}
			{/if}
		</p>
	</div>

	{#if isAddMode}
		<AddProductForm
			bind:product
			bind:comment
			{addLanguage}
			{brandNames}
			{categoryNames}
			{countriesNames}
			languages={filteredLanguages}
			{getIngredientsImage}
			{getNutritionImage}
			{isSubmitting}
			{labelNames}
			{originNames}
			{submit}
			{storeNames}
			{handleNutrimentInput}
		/>
	{:else}
		<EditProductForm
			bind:comment
			bind:product
			{handleNutrimentInput}
			{isSubmitting}
			{getIngredientsImage}
			{getNutritionImage}
			{submit}
			{addLanguage}
			{brandNames}
			{categoryNames}
			{countriesNames}
			{labelNames}
			{originNames}
			{storeNames}
			languages={filteredLanguages}
		/>
	{/if}
</div>
