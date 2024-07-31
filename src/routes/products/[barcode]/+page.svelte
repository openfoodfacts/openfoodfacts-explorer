<script lang="ts">
	import { getOrDefault } from '$lib/api';
	import { isConfigured as isPriceConfigured } from '$lib/api/prices';
	import { isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
	import { preferences } from '$lib/settings';

	import EcoScore from '$lib/ecoscore/EcoScore.svelte';
	import KnowledgePanels from '$lib/knowledgepanels/Panels.svelte';
	import Nova from '$lib/nova/Nova.svelte';
	import NutriScore from '$lib/nutriscore/NutriScore.svelte';
	import Folksonomy from './Folksonomy.svelte';
	import Card from '$lib/ui/Card.svelte';
	import Debug from '$lib/ui/Debug.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';

	import type { PageData } from './$types';
	import Prices from './Prices.svelte';
	import Gs1Country from './GS1Country.svelte';

	export let data: PageData;
	$: product = data.state.product;

	$: lang = $preferences.lang;
</script>

<svelte:head>
	<title>{product.product_name ?? product.code} | Open Food Facts</title>
</svelte:head>

<Card>
	<div class="items-center gap-2 max-md:mb-4 max-md:text-center md:flex">
		<h1 class="my-4 grow text-3xl font-bold md:text-4xl">
			{product.product_name ?? product.code}
		</h1>

		<a
			href={'https://world.openfoodfacts.org/product/' + product.code}
			target="_blank"
			rel="noopener noreferrer"
			class="link me-4"
		>
			See on OpenFoodFacts
		</a>

		<a href={`/products/${product.code}/edit`} class="btn btn-secondary ml-auto max-sm:btn-sm">
			Edit
		</a>
	</div>

	<div class="flex flex-col-reverse gap-4 md:flex-row">
		<div class="grid max-h-max w-3/4 grid-cols-[max-content,1fr] gap-x-4 gap-y-1">
			<span class="text-end font-bold">Quantity:</span>
			<span>{product.quantity}</span>

			<span class="text-end font-bold">Brands:</span>
			<span>
				{#await data.taxo.brands}
					Loading...
				{:then brands}
					{#each product.brands_tags as tag, i}
						{#if i > 0},
						{/if}
						{brands[tag] != null ? getOrDefault(brands[tag].name, lang) : tag}
					{/each}
				{/await}
			</span>

			<span class="text-end font-bold">Categories:</span>
			<span>
				{#await data.taxo.categories}
					Loading...
				{:then categories}
					{#each product.categories_tags as tag, i}
						{#if i > 0},
						{/if}
						<a class="link" href={'/taxo/categories/' + tag}
							>{categories[tag] != null ? getOrDefault(categories[tag].name, lang) : tag}</a
						>
					{/each}
				{/await}
			</span>

			<span class="text-end font-bold">Stores:</span>
			<span>
				{#await data.taxo.stores}
					Loading...
				{:then stores}
					{#each product.stores_tags as tag, i}
						{#if i > 0},
						{/if}
						{stores[tag] != null ? getOrDefault(stores[tag].name, lang) : tag}
					{/each}
				{/await}
			</span>

			<span class="text-end font-bold">Labels:</span>
			<span>
				{#await data.taxo.labels}
					Loading...
				{:then labels}
					{#each product.labels_tags as tag, i}
						{#if i > 0},
						{/if}
						<a class="link" href={'/taxo/labels/' + tag}>
							{labels[tag] != null ? getOrDefault(labels[tag].name, lang) : tag}
						</a>
					{/each}
				{/await}
			</span>
		</div>

		<div class="flex flex-grow justify-center">
			<ImageButton src={product.image_front_url} alt={product.product_name} />
		</div>
	</div>
</Card>

<div class="flex w-full justify-evenly gap-4 p-3">
	<NutriScore grade={product.nutriscore_grade} />
	<Nova grade={product.nova_group} />
	<EcoScore grade={product.ecoscore_grade} />
</div>

<KnowledgePanels knowledgePanels={product.knowledge_panels} />

<Gs1Country barcode={product.code} />

{#if isFolksonomyConfigured()}
	<Card>
		<h1 class="my-4 text-4xl font-bold">
			Folksonomy Engine <span class="font-light italic">(beta)</span>
		</h1>

		<Folksonomy
			tags={data.tags?.data ?? []}
			keys={data.keys.map((it) => it.k)}
			barcode={product.code}
		/>
	</Card>
{/if}

{#if isPriceConfigured() && data?.prices?.data != null}
	<Card>
		<h1 class="my-4 text-4xl font-bold">
			Open prices <span class="font-light italic">(alpha)</span>
		</h1>

		<Prices prices={data.prices.data} barcode={product.code} />
	</Card>
{/if}

<Card>
	{#await data?.questions}
		Loading...
	{:then questions}
		<h1 class="my-4 text-4xl font-bold">Questions</h1>

		<Debug data={questions} />
	{/await}
</Card>
