<script lang="ts">
	import NutriScore from '$lib/nutriscore/NutriScore.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: product = data.productState.product;
</script>

<div class="container flex-col flex gap-4 xl:max-w-6xl mx-auto my-2">
	<div class="shadow-md rounded-2xl p-3 w-full flex gap-2 bg-base-100 dark:bg-base-300">
		<div class="flex-grow">
			<h1 class="font-bold text-4xl my-4">{product.product_name}</h1>

			Quantity: {product.quantity}
		</div>
		<div>
			<img src={product.image_front_url} alt={product.product_name} class="w-32 float-right" />
		</div>
	</div>

	<div class="shadow-md rounded-2xl p-3 w-full flex gap-2 bg-base-100 dark:bg-base-300">
		<NutriScore nutriscoreGrade={product.nutriscore_grade} />
	</div>

	<div class="shadow-md rounded-2xl p-3 w-full bg-base-100 dark:bg-base-300">
		<h3 class="text-3xl font-bold my-3">Health</h3>

		<details open>
			<summary class="text-xl my-3 hover:bg-base-200 p-3 rounded-xl cursor-pointer">
				Ingredients
			</summary>
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
		</details>

		<details open>
			<summary class="text-xl my-3 hover:bg-base-200 p-3 rounded-xl cursor-pointer">
				Additives
			</summary>
			<ul>
				{#each product.additives_tags as tag}
					<li>{tag}</li>
				{/each}
			</ul>
		</details>
	</div>
</div>
