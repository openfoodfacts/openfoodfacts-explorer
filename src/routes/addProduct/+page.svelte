<script lang="ts">
	import { writable, get } from 'svelte/store';
	import { page } from '$app/stores';
	import Card from '$lib/ui/Card.svelte';
	import { addOrEditProductV2 } from '$lib/api';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const barcode = $page.url.searchParams.get('barcode') ?? '';

	let currentUser = {
		isLoggedIn: false,
		user_id: '',
		password: ''
	};

	onMount(() => {
		const preferences = localStorage.getItem('preferences');
		const parsedPreferences = preferences ? JSON.parse(preferences) : null;

		const user_id = parsedPreferences ? parsedPreferences.username : null;
		const password = parsedPreferences ? parsedPreferences.password : null;

		if (user_id && password) {
			currentUser = {
				isLoggedIn: true,
				user_id,
				password
			};
		} else {
			alert('You must be logged in access this page');
			goto('/settings');
		}

		if (!barcode) {
			alert('Barcode required to access this page');
			goto('/');
		}
	});

	let newProduct = writable({
		_id: '',
		code: barcode,
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

	async function handleImageUpload(event: Event, type: 'front' | 'ingredients') {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			try {
				const fileReader = new FileReader();
				fileReader.readAsDataURL(file);
				fileReader.onload = async () => {
					const dataUrl = fileReader.result as string;

					const payload = {
						user_id: currentUser.user_id,
						password: currentUser.password,
						code: barcode,
						imageField: type,
						imgupload_front: dataUrl
					};

					const response = await fetch(
						'https://world.openfoodfacts.net/cgi/product_image_upload.pl',
						{
							method: 'POST',
							body: JSON.stringify(payload),
							headers: {
								'Content-Type': file.type,
								'User-Agent': 'OpenFoodFactsExplorer/1.0'
							}
						}
					);

					if (!response.ok) {
						console.error('Failed to upload image:', response.status, response.statusText);
						alert(`Failed to upload image: ${response.statusText}`);
						return;
					}

					const data = await response.json();

					if (data.status === 1) {
						newProduct.update((product) => {
							if (type === 'front') {
								product.image_front_url = data.image.url;
							} else if (type === 'ingredients') {
								product.image_ingredients_url = data.image.url;
							}
							return product;
						});
						alert('Image uploaded successfully!');
					} else {
						alert(`Failed to upload image: ${data.error}`);
					}
				};

				fileReader.onerror = (error) => {
					console.error('Error reading file:', error);
					alert('An error occurred while reading the file.');
				};
			} catch (error) {
				console.error('Error uploading image:', error);
				alert('An error occurred while uploading the image.');
			}
		}
	}
</script>

<div class="my-3 text-center text-4xl font-semibold">Add a Product</div>
<Card>
	<h3 class="mb-4 text-3xl font-semibold">Product characteristics</h3>
	<div class="mb-4 flex items-center gap-2">
		Barcode: {barcode}
	</div>
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
		<label for="quantity">Quantity</label>
		<input
			id="quantity"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.quantity}
			placeholder="Enter quantity (e.g., 500g)"
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
		<label for="labels">Labels, certifications, awards</label>
		<input
			id="labels"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.labels}
			placeholder="Enter labels, certifications, awards (comma-separated)"
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

	<div class="form-control mb-4">
		<label for="origins">Origins</label>
		<input
			id="origins"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.origins}
			placeholder="Enter origins (comma-separated)"
		/>
	</div>

	<div class="form-control mb-4">
		<label for="countries">Countries</label>
		<input
			id="countries"
			type="text"
			class="input input-bordered w-full"
			bind:value={$newProduct.countries}
			placeholder="Enter countries (comma-separated)"
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

	<table class="mt-4 w-full table-auto border-collapse border border-gray-300 sm:w-3/4 lg:w-1/2">
		<thead>
			<tr class="bg-secondary text-black">
				<th class="border border-gray-300 px-4 py-2">Nutrient</th>
				<th class="border border-gray-300 px-4 py-2">Value (per 100g)</th>
				<th class="border border-gray-300 px-4 py-2">Unit</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="border border-gray-300 px-4 py-2">Energy</td>
				<td class="border border-gray-300 px-4 py-2">
					<input
						type="number"
						bind:value={$newProduct.nutriments.energy_100g}
						class="bg-base-300 w-full px-2 py-1 focus:outline-none"
					/>
				</td>
				<td class="border border-gray-300 px-4 py-2">kJ</td>
			</tr>

			<tr>
				<td class="border border-gray-300 px-4 py-2">Energy (kcal)</td>
				<td class="border border-gray-300 px-4 py-2">
					<input
						type="number"
						bind:value={$newProduct.nutriments['energy-kcal_100g']}
						class="bg-base-300 w-full px-2 py-1 focus:outline-none"
					/>
				</td>
				<td class="border border-gray-300 px-4 py-2">kcal</td>
			</tr>

			{#each Object.keys(unitSelection) as nutrient (nutrient)}
				<tr>
					<td class="border border-gray-300 px-4 py-2">{nutrient.replace('-', ' ')}</td>
					<td class="border border-gray-300 px-4 py-2">
						<input
							type="number"
							bind:value={
								$newProduct.nutriments[(nutrient + '_100g') as keyof typeof $newProduct.nutriments]
							}
							class="bg-base-300 w-full px-2 py-1 focus:outline-none"
						/>
					</td>
					<td class="border border-gray-300 px-4 py-2">
						<select
							bind:value={unitSelection[nutrient as keyof typeof unitSelection]}
							class="bg-base-300 border-none outline-none"
						>
							<option value="g">g</option>
							<option value="mg">mg</option>
							<option value="mcg">mcg/µg</option>
						</select>
					</td>
				</tr>
			{/each}
			<tr>
				<td class="border border-gray-300 px-4 py-2">Alcohol</td>
				<td class="border border-gray-300 px-4 py-2">
					<input
						type="number"
						bind:value={$newProduct.nutriments.alcohol_100g}
						class="bg-base-300 w-full px-2 py-1 focus:outline-none"
					/>
				</td>
				<td class="border border-gray-300 px-4 py-2">% vol / °</td>
			</tr>
		</tbody>
	</table>
</Card>

<button class="btn btn-primary mt-4 w-full" onclick={() => submit()}>Add Product</button>
