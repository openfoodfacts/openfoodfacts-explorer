<script lang="ts">
	import { writable, get } from 'svelte/store';
	import Card from '$lib/ui/Card.svelte';
	import { addOrEditProductV2 } from '$lib/api';

	let newProduct = writable({
		_id: '',
		code: '',
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
		images: {
			front: {
				url: '',
				sizes: { full: { w: 0, h: 0 }, 100: { w: 0, h: 0 }, 400: { w: 0, h: 0 } },
				uploaded_t: '',
				uploader: ''
			} as {
				url: string;
				sizes: {
					full: { w: number; h: number };
					100: { w: number; h: number };
					400: { w: number; h: number };
				};
				uploaded_t: string;
				uploader: string;
			},
			ingredients: {
				url: '',
				sizes: { full: { w: 0, h: 0 }, 100: { w: 0, h: 0 }, 400: { w: 0, h: 0 } },
				uploaded_t: '',
				uploader: ''
			} as {
				url: string;
				sizes: {
					full: { w: number; h: number };
					100: { w: number; h: number };
					400: { w: number; h: number };
				};
				uploaded_t: string;
				uploader: string;
			}
		},
		nutriscore: '',
		nova_group: 0,
		greenscore: '',
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
		nutriments: {
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
			fiber: 0,
			fiber_100g: 0,
			fiber_serving: 0,
			fiber_unit: '',
			fiber_value: 0,
			fruits_vegetables_nuts_estimate: 0,
			fruits_vegetables_nuts_estimate_100g: 0,
			fruits_vegetables_nuts_estimate_serving: 0,
			fruits_vegetables_nuts_estimate_unit: '',
			fruits_vegetables_nuts_estimate_value: 0,
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
			'trans-fat': 0,
			'trans-fat_100g': 0,
			'trans-fat_serving': 0,
			'trans-fat_unit': '',
			'trans-fat_value': 0,
			cholesterol: 0,
			cholesterol_100g: 0,
			cholesterol_serving: 0,
			cholesterol_unit: '',
			cholesterol_value: 0,
			vitamins: 0,
			vitamins_100g: 0,
			vitamins_serving: 0,
			vitamins_unit: '',
			vitamins_value: 0,
			minerals: 0,
			minerals_100g: 0,
			minerals_serving: 0,
			minerals_unit: '',
			minerals_value: 0,
			sodium: 0,
			sodium_100g: 0,
			sodium_serving: 0,
			sodium_unit: '',
			sodium_value: 0
		},
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
		nutriscore_grade: '',
		ecoscore_grade: ''
	});

	async function submit(fetch: typeof window.fetch = window.fetch) {
		const productData = get(newProduct);

		try {
			const response = await addOrEditProductV2(productData, fetch);
			if (response) {
				alert('Product added successfully!');
			} else {
				alert('Failed to add product.');
			}
		} catch (error) {
			console.error('Error adding product:', error);
			alert('An error occurred while adding the product.');
		}
	}

	async function convertToBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = (error) => reject(error);
		});
	}

	async function handleImageUpload(event: Event, type: 'front' | 'ingredients') {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			try {
				const base64Image = await convertToBase64(file);

				newProduct.update((product) => {
					if (type === 'front') {
						product.image_front_url = `data:${file.type};base64,${base64Image.split(',')[1]}`;
					} else if (type === 'ingredients') {
						product.image_ingredients_url = `data:${file.type};base64,${base64Image.split(',')[1]}`; 
					}
					return product;
				});
			} catch (error) {
				console.error('Error converting image to Base64:', error);
			}
		}
	}
</script>

<div class="my-3 text-center text-4xl font-semibold">Add a Product</div>
<Card>
	<h3 class="mb-4 text-3xl font-bold">Basic Information</h3>
	<div class="form-control mb-4">
		<label for="product_name">Product Name</label>
		<input
			id="product_name"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.product_name}
			placeholder="Enter product name"
		/>
	</div>
	<div class="form-control mb-4">
		<label for="code">Barcode*</label>
		<input
			id="code"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.code}
			placeholder="Enter barcode"
			required
		/>
	</div>
	<div class="form-control mb-4">
		<label for="quantity">Quantity</label>
		<input
			id="quantity"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.quantity}
			placeholder="Enter quantity (e.g., 500g)"
		/>
	</div>
</Card>

<Card>
	<h3 class="mb-4 text-3xl font-bold">Categories and Tags</h3>
	<div class="form-control mb-4">
		<label for="categories">Categories</label>
		<input
			id="categories"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.categories}
			placeholder="Enter categories (comma-separated)"
		/>
	</div>
	<div class="form-control mb-4">
		<label for="labels">Labels</label>
		<input
			id="labels"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.labels}
			placeholder="Enter labels (comma-separated)"
		/>
	</div>
	<div class="form-control mb-4">
		<label for="brands">Brands</label>
		<input
			id="brands"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.brands}
			placeholder="Enter brands (comma-separated)"
		/>
	</div>
	<div class="form-control mb-4">
		<label for="stores">Stores</label>
		<input
			id="stores"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.stores}
			placeholder="Enter stores (comma-separated)"
		/>
	</div>
</Card>

<Card>
	<h3 class="mb-4 text-3xl font-bold">Images</h3>
	<div class="form-control mb-4">
		<label for="front_image">Front Packaging Photo</label>
		<label
			for="front_image"
			class="relative mt-1 flex h-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300"
		>
			{#if $newProduct.image_front_url != ''}
				<div class="flex flex-col items-center">
					<span class="icon-[mdi--check-circle] text-4xl text-green-500"></span>
					<a
						href={$newProduct.image_front_url}
						target="_blank"
						class="mt-2 text-blue-500 underline"
					>
						View Image
					</a>
				</div>
			{:else}
				<div class="flex flex-col items-center">
					<span class="icon-[mdi--plus-circle] text-4xl text-gray-500"></span>
					<span class="mt-2 text-gray-500">Upload Image</span>
				</div>
			{/if}
			<input
				id="front_image"
				type="file"
				class="hidden"
				accept="image/*"
				onchange={(e) => handleImageUpload(e, 'front')}
			/>
		</label>
	</div>
	<div class="form-control mb-4">
		<label for="ingredients_image">Ingredients Photo</label>
		<label
			for="ingredients_image"
			class="relative mt-1 flex h-32 cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-gray-300"
		>
			{#if $newProduct.image_ingredients_url != ''}
				<div class="flex flex-col items-center">
					<span class="icon-[mdi--check-circle] text-4xl text-green-500"></span>
					<a
						href={$newProduct.image_ingredients_url}
						target="_blank"
						class="mt-2 text-blue-500 underline"
					>
						View Image
					</a>
				</div>
			{:else}
				<div class="flex flex-col items-center">
					<span class="icon-[mdi--plus-circle] text-4xl text-gray-500"></span>
					<span class="mt-2 text-gray-500">Upload Image</span>
				</div>
			{/if}
			<input
				id="ingredients_image"
				type="file"
				class="hidden"
				accept="image/*"
				onchange={(e) => handleImageUpload(e, 'ingredients')}
			/>
		</label>
	</div>
</Card>

<Card>
	<h3 class="mb-4 text-3xl font-bold">Nutritional Information</h3>
	<div class="form-control mb-4">
		<label for="energy">Energy (kcal)</label>
		<input
			id="energy"
			type="number"
			class="input input-bordered w-full"
			bind:value={$newProduct.nutriments.energy}
		/>
	</div>
	<div class="form-control mb-4">
		<label for="fat">Fat (g)</label>
		<input
			id="fat"
			type="number"
			class="input input-bordered w-full"
			bind:value={$newProduct.nutriments.fat}
		/>
	</div>
	<div class="form-control mb-4">
		<label for="proteins">Proteins (g)</label>
		<input
			id="proteins"
			type="number"
			class="input input-bordered w-full"
			bind:value={$newProduct.nutriments.proteins}
		/>
	</div>
</Card>

<Card>
	<h3 class="mb-4 text-3xl font-bold">Additional Information</h3>
	<div class="form-control mb-4">
		<label for="nutriscore">NutriScore</label>
		<select
			id="nutriscore"
			class="select select-bordered w-full"
			bind:value={$newProduct.nutriscore_grade}
		>
			<option value="" disabled selected>Select NutriScore</option>
			<option value="a">A</option>
			<option value="b">B</option>
			<option value="c">C</option>
			<option value="d">D</option>
			<option value="e">E</option>
		</select>
	</div>
	<div class="form-control mb-4">
		<label for="nova_group">Nova Group</label>
		<select
			id="nova_group"
			class="select select-bordered w-full"
			bind:value={$newProduct.nova_group}
		>
			<option value={0} disabled selected>Select Nova Group</option>
			<option value={1}>1</option>
			<option value={2}>2</option>
			<option value={3}>3</option>
			<option value={4}>4</option>
		</select>
	</div>
	<div class="form-control mb-4">
		<label for="greenscore">GreenScore</label>
		<select
			id="greenscore"
			class="select select-bordered w-full"
			bind:value={$newProduct.ecoscore_grade}
		>
			<option value="" disabled selected>Select GreenScore</option>
			<option value="a">A</option>
			<option value="b">B</option>
			<option value="c">C</option>
			<option value="d">D</option>
			<option value="e">E</option>
		</select>
	</div>
</Card>

<button class="btn btn-primary mt-4 w-full" onclick={() => submit()}>Add Product</button>
