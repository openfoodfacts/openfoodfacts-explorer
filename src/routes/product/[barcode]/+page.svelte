<script lang="ts">
	import EcoScore from '$lib/ecoscore/EcoScore.svelte';
	import Nova from '$lib/nova/Nova.svelte';
	import NutriScore from '$lib/nutriscore/NutriScore.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: product = data.state.product;
</script>

<div class="container flex-col flex gap-4 xl:max-w-6xl mx-auto my-2">
	<div class="shadow-md rounded-2xl p-6 w-full bg-base-100 dark:bg-base-300">
		<div class="flex">
			<h1 class="font-bold text-4xl my-4">{product.product_name}</h1>
			<a
				href={'https://world.openfoodfacts.org/product/' + product.code}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-secondary ml-auto"
			>
				Go to OpenFoodFacts
			</a>
		</div>

		<div class="flex gap-4">
			<div class="flex-grow">
				<div class="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-1">
					<span class="font-bold text-end">Quantity:</span>
					<span>{product.quantity}</span>

					<span class="font-bold text-end">Brands:</span>
					<span>{product.brands_tags}</span>

					<span class="font-bold text-end">Categories:</span>
					<span>{product.categories_tags}</span>

					<span class="font-bold text-end">Stores:</span>
					<span>{product.stores_tags}</span>

					<span class="font-bold text-end">Labels:</span>
					<span>{product.labels_tags}</span>
				</div>
			</div>
			<div>
				<img
					src={product.image_front_url}
					alt={product.product_name}
					class="w-32 float-right rounded-lg"
				/>
			</div>
		</div>
	</div>

	<div class="p-3 w-full flex gap-4 justify-evenly">
		<NutriScore grade={product.nutriscore_grade} />
		<Nova grade={product.nova_group} />
		<EcoScore grade={product.nutriscore_grade} />
	</div>

	<div class="shadow-md rounded-2xl p-3 w-full bg-base-100 dark:bg-base-300">
		<h3 class="text-3xl font-bold my-3">Health</h3>

		<details open>
			<summary class="text-xl my-3 hover:bg-base-200 p-3 rounded-xl cursor-pointer">
				Ingredients
			</summary>

			<div class="flex gap-4">
				<table class="table w-full">
					<thead>
						<th>Id</th>
						<th>Percent</th>
						<th>Vegan</th>
						<th>Vegetarian</th>
					</thead>
					{#each product.ingredients as ingredient}
						<tr>
							<td>{ingredient.id}</td>
							<td>{ingredient.percent ?? '-'}</td>
							<td>{ingredient.vegan}</td>
							<td>{ingredient.vegetarian}</td>
						</tr>
					{/each}
				</table>

				<img class="rounded-lg" src={product.image_ingredients_url} alt="Ingredients" />
			</div>
		</details>

		<details open>
			<summary class="text-xl my-3 hover:bg-base-200 p-3 rounded-xl cursor-pointer">
				Food processing
			</summary>

			<div class="flex items-center gap-4 justify-center">
				<Nova grade={product.nova_group} />

				<span class="text-2xl">
					{#if product.nova_group === 1}
						Not processed
					{:else if product.nova_group === 2}
						Processed
					{:else if product.nova_group === 3}
						Processed
					{:else if product.nova_group === 4}
						Ultra processed
					{:else}
						Unknown
					{/if}
				</span>
			</div>
		</details>

		<details>
			<summary class="text-xl my-3 hover:bg-base-200 p-3 rounded-xl cursor-pointer">
				Additives
			</summary>
			<ul>
				{#each product.additives_tags as tag}
					<li>{tag}</li>
				{/each}
			</ul>
		</details>

		<details open>
			<summary class="text-xl my-3 hover:bg-base-200 p-3 rounded-xl cursor-pointer">
				Nutritional values
			</summary>
			<div class="flex gap-4">
				<table class="table grow table-compact">
					<thead>
						<th>Nutriment</th>
						<th>Per 100g</th>
						<th>Per serving</th>
					</thead>
					<tr>
						<td>Energy (kcal)</td>
						<td>
							{product.nutriments['energy-kcal_100g']} ({product.nutriments['energy-kcal_unit']})
						</td>
						<td>
							{product.nutriments['energy-kcal_serving']} ({product.nutriments['energy-kcal_unit']})
						</td>
					</tr>
					<tr>
						<td>Energy (J)</td>
						<td>
							{product.nutriments['energy-kj_100g']}
							({product.nutriments['energy-kj_unit']})
						</td>
						<td>
							{product.nutriments['energy-kj_serving']}
							({product.nutriments['energy-kj_unit']})
						</td>
					</tr>
					<tr>
						<td>Carbohydrates</td>
						<td>
							{product.nutriments.carbohydrates_100g}
							({product.nutriments.carbohydrates_unit})
						</td>
						<td>
							{product.nutriments.carbohydrates_serving}
							({product.nutriments.carbohydrates_unit})
						</td>
					</tr>
					<tr>
						<td><span class="ml-4">of which sugars</span></td>
						<td>
							{product.nutriments.sugars_100g}
							({product.nutriments.carbohydrates_unit})
						</td>
						<td>
							{product.nutriments.sugars_serving}
							({product.nutriments.carbohydrates_unit})
						</td>
					</tr>
					<tr>
						<td>Proteins</td>
						<td>{product.nutriments.proteins_100g} ({product.nutriments.proteins_unit})</td>
						<td>{product.nutriments.proteins_serving} ({product.nutriments.proteins_unit})</td>
					</tr>
					<tr>
						<td>Fat</td>
						<td>{product.nutriments.fat_100g} ({product.nutriments.fat_unit})</td>
						<td>{product.nutriments.fat_serving} ({product.nutriments.fat_unit})</td>
					</tr>
					<tr>
						<td><span class="ml-4">of which saturated</span></td>
						<td>
							{product.nutriments['saturated-fat_100g']}
							({product.nutriments['saturated-fat_unit']})
						</td>
						<td>
							{product.nutriments['saturated-fat_serving']}
							({product.nutriments['saturated-fat_unit']})
						</td>
					</tr>
					<tr>
						<td>Salt</td>
						<td>
							{product.nutriments.salt_100g}
							({product.nutriments.salt_unit})
						</td>
						<td>
							{product.nutriments.salt_serving}
							({product.nutriments.salt_unit})
						</td>
					</tr>
					<tr>
						<td>Sodium</td>
						<td>
							{product.nutriments.sodium_100g}
							({product.nutriments.sodium_unit})
						</td>
						<td>
							{product.nutriments.sodium_serving}
							({product.nutriments.sodium_unit})
						</td>
					</tr>
				</table>

				<div class="grow-0">
					<img class="rounded-xl" src={product.image_nutrition_url} alt="Ingredient photo" />
				</div>
			</div>
		</details>
	</div>
</div>
