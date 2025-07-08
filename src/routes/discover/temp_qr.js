{
	/* <script lang="ts">
	import { writable, get } from 'svelte/store';
	import { page } from '$app/stores';
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

	$effect(() => {
		productStore.subscribe((it) => {
			console.debug('Product store changed', it);
		});
	});
</script>

<div class="space-y-4">
	<div class="collapse-arrow dark:bg-base-200 collapse bg-white p-2 shadow-md">
		<input type="checkbox" />
		<div class="collapse-title font-semibold">{$_('product.edit.add_language')}</div>
		<div class="collapse-content text-sm">
			<label class="input w-full">
				<span class="icon-[mdi--search] h-5 w-5"></span>
				<input
					type="search"
					placeholder={$_('product.edit.search_languages')}
					bind:value={languageSearch}
				/>
			</label>
			{#if filteredLanguages.length === 0}
				<p class="mt-4 text-center opacity-70">{$_('product.edit.no_languages_found')}</p>
			{:else}
				<div
					class="mt-2 grid max-h-96 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 overflow-auto"
				>
					{#each filteredLanguages as code (code)}
						<button class="btn btn-ghost" onclick={() => addLanguage(code)}>
							{getLanguage(code)}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="tabs tabs-box">
		{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
			<input
				type="radio"
				name="name_tabs"
				class="tab"
				aria-label={getLanguage(code)}
				defaultChecked={code === $productStore.lang}
			/>
			<div class="tab-content form-control p-6">
				<label for="">{$_('product.edit.name')} ({getLanguage(code)})</label>
				<input
					type="text"
					class="input input-bordered w-full"
					bind:value={$productStore[`product_name_${code}`]}
				/>
			</div>
		{/each}

		{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
			<div class="alert alert-warning">{$_('product.edit.no_languages_found')}</div>
		{/if}
	</div>

	<Card>
		<div class="form-control mb-4">
			<label for="">{$_('product.edit.quantity')}</label>
			<input type="text" class="input input-bordered w-full" bind:value={$productStore.quantity} />
		</div>

		<div class="form-control mb-4">
			<label for="">{$_('product.edit.emb_code')}</label>
			<input type="text" class="input input-bordered w-full" bind:value={$productStore.emb_codes} />
		</div>

		<div class="form-control mb-4">
			<label for="">{$_('product.edit.packaging')}</label>
			<input type="text" class="input input-bordered w-full" bind:value={$productStore.packaging} />
		</div>

		<div class="form-control mb-4">
			<label for="">{$_('product.edit.manufacturing_places')}</label>
			<input
				type="text"
				class="input input-bordered w-full"
				bind:value={$productStore.manufacturing_places}
			/>
		</div>

		<div class="form-control mb-4">
			<label for="">{$_('product.edit.categories')}</label>
			<TagsString bind:tagsString={$productStore.categories} autocomplete={categoryNames} />
		</div>
		<div class="mb-4">
			<label for="">{$_('product.edit.labels')}</label>
			<TagsString bind:tagsString={$productStore.labels} autocomplete={labelNames} />
		</div>
		<div class="mb-4">
			<label for="">{$_('product.edit.brands')}</label>
			<TagsString bind:tagsString={$productStore.brands} autocomplete={brandNames} />
		</div>
		<div class="mb-4">
			<label for="">{$_('product.edit.stores')}</label>
			<TagsString bind:tagsString={$productStore.stores} autocomplete={storeNames} />
		</div>
		<div class="mb-4">
			<label for="">{$_('product.edit.origins')}</label>
			<TagsString bind:tagsString={$productStore.origins} autocomplete={originNames} />
		</div>
		<div class="mb-4">
			<label for="">{$_('product.edit.countries')}</label>
			<TagsString bind:tagsString={$productStore.countries} autocomplete={countriesNames} />
		</div>

		<div class="mb-4">
			<TraceabilityCodes bind:traceabilityCodes={$productStore.emb_codes} autocomplete={[]} />
		</div>

		<div class="mb-4">
			<label for="">{$_('product.edit.website_url')}</label>
			<input type="text" class="input input-bordered w-full" bind:value={$productStore.link} />
		</div>
	</Card>

	<Card>
		<PhotoManager product={$productStore} />
	</Card>

	<Card>
		<h3 class="mb-4 text-3xl font-bold">{$_('product.edit.ingredients')}</h3>
		<div class="tabs tabs-box">
			{#each Object.keys($productStore.languages_codes ?? {}) as code (code)}
				<input
					type="radio"
					name="ingredients_tabs"
					class="tab"
					aria-label={getLanguage(code)}
					defaultChecked={code === $productStore.lang}
				/>
				<div class="tab-content form-control p-6">
					{#if getIngredientsImage(code)}
						<img src={getIngredientsImage(code)} alt="Ingredients" class="mb-4" />
					{:else}
						<p class="alert alert-warning mb-4">{$_('product.edit.no_ingredients_image')}</p>
					{/if}
					<label for="">{$_('product.edit.ingredients_list')} ({getLanguage(code)})</label>
					<div class="form-control mb-4">
						<textarea
							class="textarea textarea-bordered h-40 w-full"
							bind:value={$productStore[`ingredients_text_${code}`]}
						></textarea>
					</div>
				</div>
			{/each}

			{#if Object.keys($productStore.languages_codes ?? {}).length === 0}
				<div class="alert alert-warning">{$_('product.edit.no_languages_found')}</div>
			{/if}
		</div>
	</Card>

	<Card>
		<h3 class="mb-4 text-3xl font-bold">{$_('product.edit.nutritional_information')}</h3>
		<div class="form-control mb-4">
			<label for="">{$_('product.edit.serving_size')}</label>
			<input
				type="text"
				class="input input-bordered w-full"
				bind:value={$productStore.serving_size}
			/>
		</div>

		<div class="form-control mb-4">
			<label class="label cursor-pointer justify-start gap-2">
				<input type="checkbox" class="checkbox" bind:checked={$productStore.no_nutrition_data} />
				<span class="label-text">{$_('product.edit.no_nutrition_data')}</span>
			</label>
		</div>

		{#if !$productStore.no_nutrition_data}
			<div class="grid grid-cols-2 gap-4">
				<div class="form-control mb-4">
					<label for="">Energy (kJ)</label>
					<input
						type="number"
						class="input input-bordered w-full"
						value={$productStore.nutriments?.['energy-kj_100g'] ?? ''}
						oninput={(e) => handleNutrimentInput(e, 'energy-kj_100g')}
					/>
				</div>
				<div class="form-control mb-4">
					<label for="">Energy (kcal)</label>
					<input
						type="number"
						class="input input-bordered w-full"
						value={$productStore.nutriments?.['energy-kcal_100g'] ?? ''}
						oninput={(e) => handleNutrimentInput(e, 'energy-kcal_100g')}
					/>
				</div>
				<div class="form-control mb-4">
					<label for="">Fat (g)</label>
					<input
						type="number"
						class="input input-bordered w-full"
						value={$productStore.nutriments?.fat_100g ?? ''}
						oninput={(e) => handleNutrimentInput(e, 'fat_100g')}
					/>
				</div>
				<div class="form-control mb-4">
					<label for="">Saturated Fat (g)</label>
					<input
						type="number"
						class="input input-bordered w-full"
						value={$productStore.nutriments?.['saturated-fat_100g'] ?? ''}
						oninput={(e) => handleNutrimentInput(e, 'saturated-fat_100g')}
					/>
				</div>
				<div class="form-control mb-4">
					<label for="">Carbohydrates (g)</label>
					<input
						type="number"
						class="input input-bordered w-full"
						value={$productStore.nutriments?.carbohydrates_100g ?? ''}
						oninput={(e) => handleNutrimentInput(e, 'carbohydrates_100g')}
					/>
				</div>
				<div class="form-control mb-4">
					<label for="">Sugars (g)</label>
					<input
						type="number"
						class="input input-bordered w-full"
						value={$productStore.nutriments?.sugars_100g ?? ''}
						oninput={(e) => handleNutrimentInput(e, 'sugars_100g')}
					/>
				</div>
				<div class="form-control mb-4">
					<label for="">Proteins (g)</label>
					<input
						type="number"
						class="input input-bordered w-full"
						value={$productStore.nutriments?.proteins_100g ?? ''}
						oninput={(e) => handleNutrimentInput(e, 'proteins_100g')}
					/>
				</div>
				<div class="form-control mb-4">
					<label for="">Salt (g)</label>
					<input
						type="number"
						class="input input-bordered w-full"
						value={$productStore.nutriments?.salt_100g ?? ''}
						oninput={(e) => handleNutrimentInput(e, 'salt_100g')}
					/>
				</div>
				<div class="form-control mb-4">
					<label for="">Sodium (g)</label>
					<input
						type="number"
						class="input input-bordered w-full"
						value={$productStore.nutriments?.sodium_100g ?? ''}
						oninput={(e) => handleNutrimentInput(e, 'sodium_100g')}
					/>
				</div>
			</div>
		{:else}
			<div class="alert alert-info">{$_('product.edit.no_nutrition_specified')}</div>
		{/if}
	</Card>

	<Card>
		<div class="form-control mb-4">
			<label for="comment">{$_('product.edit.comment')}</label>
			<input
				id="comment"
				type="text"
				class="input input-bordered w-full"
				placeholder={$_('product.edit.comment_placeholder')}
				bind:value={$comment}
			/>
		</div>
	</Card>

	<div class="sticky bottom-2.5 z-1 rounded-md">
		<button class="btn btn-primary w-full" onclick={submit} disabled={isSubmitting}>
			{#if isSubmitting}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{productNotFound ? $_('product.edit.add_product') : $_('product.edit.save_btn')}
		</button>
	</div>
</div>

<details>
	<summary>{$_('product.edit.debug')}</summary>
	<pre>{JSON.stringify(data, null, 2)}</pre>
</details> */
}
