<script lang="ts">
	import { writable, get } from 'svelte/store';
	import ISO6391 from 'iso-639-1';

	import { getOrDefault, ProductsApi, type SelectedImage, type Taxonomy } from '$lib/api';
	import { preferences } from '$lib/settings';
	import Card from '$lib/ui/Card.svelte';

	import type { PageData } from './$types';
	import TagsString from './TagsString.svelte';
	import { PRODUCT_IMAGE_URL } from '$lib/const';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

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
	let productStore = $derived(writable(data.state.product));
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

	function addLanguage(code: string) {
		productStore.update((store) => {
			store.languages_codes = { ...store.languages_codes, [code]: 0 };
			return store;
		});
	}

	function getIngredientsImage(language: string) {
		const paddedBarcode = get(productStore).code.toString().padStart(13, '0');
		const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
		if (!match) {
			throw new Error('Invalid barcode format');
		}
		const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
		const imageName = 'ingredients_' + language;
		const image = get(productStore).images[imageName];
		if (!image) {
			return '';
		}
		const rev = (image as SelectedImage).rev;
		const filename = `${imageName}.${rev}.400.jpg`;
		return PRODUCT_IMAGE_URL(`${path}/${filename}`);
	}

	$effect(() => {
		productStore.subscribe((it) => {
			console.debug('Product store changed', it);
		});
	});
</script>

<div class="collapse-arrow dark:bg-base-200 collapse bg-white p-2 shadow-md">
	<input type="checkbox" />
	<div class="collapse-title font-semibold">Add a language</div>
	<div class="collapse-content text-sm">
		<label class="input w-full">
			<span class="icon-[mdi--search] h-5 w-5"></span>
			<input type="search" placeholder="Search languages to add" bind:value={languageSearch} />
		</label>
		{#if filteredLanguages.length === 0}
			<p class="mt-4 text-center opacity-70">No languages found</p>
		{:else}
			<div
				class="mt-2 grid max-h-96 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 overflow-auto"
			>
				{#each filteredLanguages as code}
					<button class="btn btn-ghost" onclick={() => addLanguage(code)}>
						{getLanguage(code)}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<div class="tabs tabs-box">
	{#each Object.keys($productStore.languages_codes) as code}
		<input
			type="radio"
			name="name_tabs"
			class="tab"
			aria-label={getLanguage(code)}
			defaultChecked={code === $productStore.lang}
		/>
		<div class="tab-content form-control p-6">
			<label for="">Name ({getLanguage(code)})</label>
			<input
				type="text"
				class="input input-bordered w-full"
				bind:value={$productStore[`product_name_${code}`]}
			/>
		</div>
	{/each}
</div>

<Card>
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
		<label for="">Stores</label>
		<TagsString bind:tagsString={$productStore.stores} autocomplete={storeNames} />
	</div>
	<div class="mb-4">
		<label for="">Origins</label>
		<TagsString bind:tagsString={$productStore.origins} autocomplete={originNames} />
	</div>
	<div class="mb-4">
		<label for="">Countries</label>
		<TagsString bind:tagsString={$productStore.countries} autocomplete={countriesNames} />
	</div>

	<div class="mb-4">
		<label for="">Website URL</label>
		<input type="text" class="input input-bordered w-full" bind:value={$productStore.link} />
	</div>
</Card>

<Card>
	<h3 class="mb-4 text-3xl font-bold">Ingredients</h3>
	<div class="tabs tabs-box">
		{#each Object.keys($productStore.languages_codes) as code}
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
					<p class="alert alert-warning mb-4">No ingredients image</p>
				{/if}
				<label for="">Ingredients list ({getLanguage(code)})</label>
				<div class="form-control mb-4">
					<textarea
						class="textarea textarea-bordered h-40 w-full"
						bind:value={$productStore[`ingredients_text_${code}`]}
					></textarea>
				</div>
			</div>
		{/each}
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
