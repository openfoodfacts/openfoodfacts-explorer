<script lang="ts">
	import { getOrDefault, ProductsApi, type Taxonomy } from '$lib/api';
	import { preferences } from '$lib/settings';
	import Card from '$lib/ui/Card.svelte';
	import type { PageData } from './$types';
	import Tags from './Tags.svelte';

	export let data: PageData;

	function getNames(taxo: Taxonomy) {
		return Object.values(taxo)
			.map((t) => getOrDefault(t.name, $preferences.lang))
			.filter((t): t is string => t !== undefined);
	}

	$: categoryNames = getNames(data.categories);
	$: labelNames = getNames(data.labels);
	$: brandNames = getNames(data.brands);

	let newProduct = { ...data.state.product };

	async function submit() {
		console.group('Product added/edited');
		console.debug('Submitting', newProduct);
		const ok = await new ProductsApi(fetch).addOrEditProductV2(newProduct);
		console.debug('Submitted', ok);
		console.groupEnd();
		if (ok) {
			window.location.href = '/products/' + newProduct.code;
		}
	}
</script>

<Card>
	<div class="form-control mb-4">
		<label for="">Name</label>
		<input type="text" class="input input-bordered w-full" bind:value={newProduct.product_name} />
	</div>

	<div class="form-control mb-4">
		<label for="">Quantity</label>
		<input type="text" class="input input-bordered w-full" bind:value={newProduct.quantity} />
	</div>

	<div class="form-control mb-4">
		<label for="">Categories: </label>
		<Tags
			tags={data.state.product.categories.split(',').filter((c) => c !== '')}
			autocomplete={categoryNames}
			on:change={(e) => (newProduct.categories = e.detail.tags.join(','))}
		/>
	</div>
	<div class="mb-4">
		<label for="">Labels</label>
		<Tags
			tags={data.state.product.labels.split(',').filter((l) => l !== '')}
			autocomplete={labelNames}
			on:change={(e) => (newProduct.labels = e.detail.tags.join(','))}
		/>
	</div>
	<div class="mb-4">
		<label for="">Brands</label>
		<Tags
			tags={data.state.product.brands.split(',').filter((l) => l !== '')}
			autocomplete={brandNames}
			on:change={(e) => (newProduct.brands = e.detail.tags.join(','))}
		/>
	</div>
</Card>
<button class="btn btn-primary" on:click={submit}> Submit </button>

<details>
	<summary>Debug</summary>
	<pre>{JSON.stringify(data, null, 2)}</pre>
</details>
