<script lang="ts">
	import { writable, get } from 'svelte/store';

	import { getOrDefault, ProductsApi, type Taxonomy } from '$lib/api';
	import { preferences } from '$lib/settings';
	import Card from '$lib/ui/Card.svelte';

	import type { PageData } from './$types';
	import TagsString from './TagsString.svelte';

	export let data: PageData;

	function getNames(taxo: Taxonomy) {
		return Object.values(taxo)
			.map((t) => getOrDefault(t.name, $preferences.lang))
			.filter((t): t is string => t !== undefined);
	}

	$: categoryNames = getNames(data.categories);
	$: labelNames = getNames(data.labels);
	$: brandNames = getNames(data.brands);

	let productStore = writable(data.state.product);

	async function submit() {
		const product = get(productStore);

		console.group('Product added/edited');
		console.debug('Submitting', product);
		const ok = await new ProductsApi(fetch).addOrEditProductV2(product);
		console.debug('Submitted', ok);
		console.groupEnd();
		if (ok) {
			window.location.href = '/products/' + product.code;
		}
	}

	$: {
		productStore.subscribe((it) => {
			console.debug('Product store changed', it);
		});
	}
</script>

<Card>
	<div class="form-control mb-4">
		<label for="">Name</label>
		<input
			type="text"
			class="input input-bordered w-full"
			bind:value={$productStore.product_name}
		/>
	</div>

	<div class="form-control mb-4">
		<label for="">Quantity</label>
		<input type="text" class="input input-bordered w-full" bind:value={$productStore.quantity} />
	</div>

	<div class="form-control mb-4">
		<label for="">Categories: </label>
		<TagsString bind:tagsString={$productStore.categories} autocomplete={categoryNames} />
	</div>
	<div class="mb-4">
		<label for="">Labels</label>
		<TagsString bind:tagsString={$productStore.labels} autocomplete={labelNames} />
	</div>
	<div class="mb-4">
		<label for="">Brands</label>
		<TagsString bind:tagsString={$productStore.brands} autocomplete={brandNames} />
	</div>
</Card>

<Card>
	<h3 class="mb-4 text-3xl font-bold">Ingredients</h3>

	{#if $productStore.image_ingredients_url}
		<img src={$productStore.image_ingredients_url} alt="Ingredients" class="mb-4" />
	{:else}
		<p class="alert alert-warning mb-4">No ingredients image</p>
	{/if}

	<div class="form-control mb-4">
		<textarea
			class="textarea textarea-bordered h-40 w-full"
			bind:value={$productStore.ingredients_text}
		/>
	</div>
</Card>
<button class="btn btn-primary" on:click={submit}> Submit </button>

<details>
	<summary>Debug</summary>
	<pre>{JSON.stringify(data, null, 2)}</pre>
</details>
