<script lang="ts">
	import { getOrDefault } from '$lib/api';
	import { isConfigured as isPriceConfigured } from '$lib/api/prices';
	import { isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
	import { preferences } from '$lib/settings';
	import { navigating } from '$app/state';
	import { addItemToCalculator, extractNutriments } from '$lib/stores/calculatorStore';

	const TRACEABILITY_CODES_URL =
		'https://wiki.openfoodfacts.org/Food_Traceability_Codes/EU_Food_establishments';

	import ProductAttributes from './ProductAttributes.svelte';

	import KnowledgePanels from '$lib/knowledgepanels/Panels.svelte';
	import Folksonomy from './Folksonomy.svelte';
	import DataSources from './DataSources.svelte';
	import Card from '$lib/ui/Card.svelte';
	import Debug from '$lib/ui/Debug.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';

	import type { PageData } from './$types';
	import Prices from './Prices.svelte';
	import Gs1Country from './GS1Country.svelte';

	let isShareSupported = navigator?.share != null;

	async function sharePage() {
		try {
			await navigator.share({
				url: window.location.href
			});
		} catch (error) {
			console.error('Error sharing the page:', error);
		}
	}

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let product = $derived(data.state.product);
	let productAttributes = $derived(data.productAttributes);

	let lang = $derived($preferences.lang);

	function addToCalculator() {
		addItemToCalculator({
			id: product.code,
			name: product.product_name || product.code,
			quantity: 100,
			imageUrl: product.image_front_small_url,
			nutriments: extractNutriments(product.nutriments)
		});
	}
</script>

<svelte:head>
	<title>{product.product_name ?? product.code} | Open Food Facts</title>
</svelte:head>

<div class="flex flex-col gap-4">
	<Card>
		<div class="items-center gap-2 max-md:mb-4 max-md:text-center md:flex">
			<h1 class="my-4 grow text-2xl font-bold md:text-4xl">
				{product.product_name ?? product.code}
			</h1>

			<div class="flex flex-wrap items-center justify-center gap-2">
				<a
					href={'https://world.openfoodfacts.org/product/' + product.code}
					target="_blank"
					rel="noopener noreferrer"
					class="link"
				>
					See on OpenFoodFacts
				</a>

				<button class="btn btn-secondary max-sm:btn-sm" onclick={addToCalculator}>
					Add to Calculator
				</button>
				<a
					href={`/products/${product.code}/edit`}
					class="btn btn-secondary max-sm:btn-sm"
					class:pointer-events-none={navigating.to}
				>
					{#if navigating.to?.params?.barcode === product.code}
						<span class="loading loading-ring loading-lg mx-auto my-auto"></span>
					{:else}
						Edit
					{/if}
				</a>
				{#if isShareSupported}
					<button
						class="btn btn-secondary max-sm:btn-sm flex items-center gap-2"
						onclick={sharePage}
					>
						<span class="icon-[mdi--share-variant] h-5 w-5"></span>
						<span class="hidden md:block">Share</span>
					</button>
				{/if}
			</div>
		</div>

		<div class="flex flex-col-reverse gap-4 md:flex-row">
			<div class="grid h-max w-full grid-cols-[max-content_1fr] gap-x-4 gap-y-2 md:w-3/4">
				<span class="text-end font-bold">Quantity:</span>
				<span>{product.quantity}</span>

				<span class="text-end font-bold">Brands:</span>
				<div class="flex flex-wrap gap-1">
					{#await data.taxo.brands}
						Loading...
					{:then brands}
						{#each product.brands_tags as tag, i (i)}
							<span class="badge h-auto break-words">
								{brands[tag] != null ? getOrDefault(brands[tag].name, lang) : tag}
							</span>
						{/each}
					{/await}
				</div>

				<span class="text-end font-bold">Categories:</span>
				<div class="flex flex-wrap gap-1">
					{#await data.taxo.categories}
						Loading...
					{:then categories}
						{#each product.categories_tags as tag (tag)}
							<a class="badge badge-secondary h-auto break-words" href="/taxo/categories/{tag}">
								{categories[tag] != null ? getOrDefault(categories[tag].name, lang) : tag}
							</a>
						{/each}
					{/await}
				</div>

				<span class="text-end font-bold">Stores:</span>
				<div class="flex flex-wrap gap-1">
					{#await data.taxo.stores}
						Loading...
					{:then stores}
						{#each product.stores_tags as tag, i (i)}
							<span class="badge h-auto break-words">
								{stores[tag] != null ? getOrDefault(stores[tag].name, lang) : tag}
							</span>
						{/each}
					{/await}
				</div>

				<span class="text-end font-bold">Labels:</span>
				<div class="flex flex-wrap gap-1">
					{#await data.taxo.labels}
						Loading...
					{:then labels}
						{#each product.labels_tags as tag, i (i)}
							<a class="badge h-auto break-words" href={'/taxo/labels/' + tag}>
								{labels[tag] != null ? getOrDefault(labels[tag].name, lang) : tag}
							</a>
						{/each}
					{/await}
				</div>

				<span class="text-end font-bold">Countries:</span>
				<div class="flex flex-wrap gap-1">
					{#await data.taxo.countries}
						Loading...
					{:then countries}
						{#each product.countries_tags as tag, i (i)}
							<a class="badge h-auto break-words" href={'/taxo/countries/' + tag}>
								{countries[tag] != null ? getOrDefault(countries[tag].name, lang) : tag}
							</a>
						{/each}
					{/await}
				</div>

				<span class="text-end font-bold">Origins:</span>
				<div class="flex flex-wrap gap-1">
					{#await data.taxo.origins}
						Loading...
					{:then origins}
						{#each product.origins_tags as tag, i (i)}
							{#if i > 0},
							{/if}
							<a class="link inline-flex items-center break-words" href={'/taxo/origin/' + tag}>
								{origins[tag] != null ? getOrDefault(origins[tag].name, lang) : tag}
							</a>
						{/each}
					{/await}
				</div>

				{#if product.emb_codes != null && product.emb_codes.length > 0}
					<span class="text-end font-bold">Traceability Codes:</span>
					<span>
						{product.emb_codes}
						<a href={TRACEABILITY_CODES_URL} target="_blank" class="ml-2 text-xs text-gray-500">
							(Learn more)
						</a>
					</span>
				{/if}
			</div>

			<div class="flex h-auto min-h-[40vh] grow justify-center max-md:min-h-[30vh]">
				<ImageButton src={product.image_front_url} alt={product.product_name} />
			</div>
		</div>
	</Card>

	<ProductAttributes {productAttributes} />

	<KnowledgePanels knowledgePanels={product.knowledge_panels} productCode={product.code} />

	<Gs1Country barcode={product.code} />

	<DataSources {product} />

	{#if isFolksonomyConfigured()}
		<Card>
			<h1 class="my-4 text-4xl font-bold">
				Folksonomy Engine <span class="font-light italic">(beta)</span>
			</h1>

			<Folksonomy
				tags={data.tags ?? []}
				keys={data.keys.map((it) => it.k)}
				barcode={product.code}
			/>
		</Card>
	{/if}

	{#if isPriceConfigured() && data?.prices?.data != null}
		<Card>
			<h1 class="my-4 text-xl font-bold sm:text-4xl">
				Open prices <span class="font-light italic">(alpha)</span>
			</h1>

			<Prices prices={data.prices.data} barcode={product.code} />
		</Card>
	{/if}

	<Card>
		{#await data?.questions}
			Loading...
		{:then questions}
			<h1 class="my-4 text-2xl font-bold sm:text-4xl">Questions</h1>

			<Debug data={questions} />
		{/await}
	</Card>
</div>
