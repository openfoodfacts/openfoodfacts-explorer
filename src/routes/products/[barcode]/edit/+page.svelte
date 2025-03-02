<script lang="ts">
	import { run } from 'svelte/legacy';

	import { writable, get } from 'svelte/store';

	import { getOrDefault, ProductsApi, type Taxonomy } from '$lib/api';
	import { preferences } from '$lib/settings';
	import Card from '$lib/ui/Card.svelte';

	import type { PageData } from './$types';
	import TagsString from './TagsString.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	function getNames(taxo: Taxonomy) {
		return Object.values(taxo)
			.map((t) => getOrDefault(t.name, $preferences.lang))
			.filter((t): t is string => t !== undefined);
	}

	let categoryNames = $derived(getNames(data.categories));
	let labelNames = $derived(getNames(data.labels));
	let brandNames = $derived(getNames(data.brands));

	let productStore = $derived(writable(data.state.product));
	let comment = writable('');

	async function submit() {
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
		}
	}

	run(() => {
		productStore.subscribe((it) => {
			console.debug('Product store changed', it);
		});
	});
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

	<div class="mb-4">
		<label for="">Website URL</label>
		<input type="text" class="input input-bordered w-full" bind:value={$productStore.link} />
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
		></textarea>
	</div>
</Card>

<Card>
	<div class="form-control mb-4">
		<label for="comment">Comment</label>
		<input
			id="comment"
			type="text"
			class="input input-bordered w-full"
			placeholder="Add a comment to this edit"
			bind:value={$comment}
		/>
	</div>
	<button class="btn btn-primary w-full" onclick={submit}> Submit </button>
</Card>

<details>
	<summary>Debug</summary>
	<pre>{JSON.stringify(data, null, 2)}</pre>
</details>
