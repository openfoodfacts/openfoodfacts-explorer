<script lang="ts">
	import { addOrEditProductV2 } from '$lib/api';
	import ImageUpload from './ImageUpload.svelte';
	import NutritionInfo from './NutritionInfo.svelte';
	import ProductDetails from './ProductDetails.svelte';
	import type { Product, Nutriments, SelectedImage, RawImage } from '$lib/api';

	interface Props {
		data: {
			barcode: string;
			user: {
				user_id: string;
				password: string;
			};
		};
	}

	const { data }: Props = $props();
	const { barcode, user } = data;

	let currentUser = {
		isLoggedIn: false,
		user_id: user?.user_id ?? '',
		password: user?.password ?? ''
	};

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

	function createEmptyProduct(barcode: string): Product {
		return {
			_id: '',
			code: barcode,
			created_t: 0,
			creator: '',
			last_modified_t: 0,
			last_editor: '',

			product_name: '',
			quantity: '',
			categories: '',
			labels: '',
			brands: '',
			stores: '',
			origins: '',
			countries: '',
			link: '',
			ingredients_text: '',
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

			languages_codes: {},
			lang: '',
			emb_codes: '',
			emb_codes_tags: [],
			editors_tags: [],
			last_checked_t: 0,
			checkers_tags: [],
			states_hierarchy: []
		};
	}

	let unitSelection = {
		Fat: 'g',
		'Saturated-fat': 'g',
		Carbohydrates: 'g',
		Sugars: 'g',
		Fiber: 'g',
		Proteins: 'g',
		Salt: 'g',
		Sodium: 'g',
		Bicarbonate: 'g',
		Potassium: 'g',
		Chloride: 'g',
		Calcium: 'g',
		Magnesium: 'mg',
		Sulphate: 'mg',
		Nitrate: 'mg'
	};

	const productData = $state(createEmptyProduct(barcode));

	async function submit(fetch: typeof window.fetch = window.fetch) {
		const processedNutriments = { ...productData.nutriments };
		for (const nutrient in unitSelection) {
			const nutrientKey = `${nutrient.toLowerCase()}_100g`;
			const unitKey = `${nutrientKey}_unit` as keyof typeof processedNutriments;

			if (nutrientKey in processedNutriments) {
				if (unitKey in processedNutriments) {
					(processedNutriments[unitKey] as unknown as string) =
						unitSelection[nutrient as keyof typeof unitSelection];
				}
			}
		}

		productData.nutriments = processedNutriments;
		try {
			const response = await addOrEditProductV2(productData, fetch);
			if (response) {
				alert('Product added successfully');
			} else {
				alert('Failed to add product');
			}
		} catch (error) {
			console.error('Error adding product:', error);
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="my-2 text-center text-4xl font-semibold">Add a Product</div>

	<ProductDetails data={productData} />

	<ImageUpload {barcode} {currentUser} {productData} />

	<NutritionInfo {productData} {unitSelection} />

	<button class="btn btn-primary mt-4 w-full" onclick={() => submit()}>Add Product</button>
</div>
