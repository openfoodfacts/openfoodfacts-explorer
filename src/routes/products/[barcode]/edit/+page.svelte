<script lang="ts">
	import { addOrEditProductV2, getOrDefault, type Taxonomy } from '$lib/api';
	import { preferences } from '$lib/settings';
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

	let newProduct = {
		...data.product.product
	};

	async function submit() {
		console.group('Product added/edited');
		console.debug('Submitting', newProduct);
		const ok = await addOrEditProductV2(newProduct, fetch);
		console.debug('Submitted', ok);
		console.groupEnd();
		if (ok) {
			window.location.href = '/products/' + newProduct.code;
		}
	}
</script>

<label for="">Categories: </label>
<Tags
	tags={data.product.product.categories.split(',').filter((c) => c !== '')}
	autocomplete={categoryNames}
	on:change={(e) => (newProduct.categories = e.detail.tags.join(','))}
/>
<details>
	<summary>Debug categories</summary>
	{newProduct.categories}
</details>

<label for="">Labels</label>
<Tags
	tags={data.product.product.labels.split(',').filter((l) => l !== '')}
	autocomplete={labelNames}
	on:change={(e) => (newProduct.labels = e.detail.tags.join(','))}
/>
<details>
	<summary>Debug labels</summary>
	{newProduct.labels}
</details>

<label for="">Brands</label>
<Tags
	tags={data.product.product.brands.split(',').filter((l) => l !== '')}
	autocomplete={brandNames}
	on:change={(e) => (newProduct.brands = e.detail.tags.join(','))}
/>
<details>
	<summary>Debug brands</summary>
	{newProduct.brands}
</details>

<button class="btn btn-primary" on:click={submit}> Submit </button>

<details>
	<summary>Debug</summary>
	<pre>{JSON.stringify(data, null, 2)}</pre>
</details>
