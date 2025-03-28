<script lang="ts">
	import { getOrDefault } from '$lib/api';
	import { isConfigured as isPriceConfigured } from '$lib/api/prices';
	import { isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
	import { preferences } from '$lib/settings';
	import { navigating } from '$app/state';

	const TRACEABILITY_CODES_URL =
		'https://wiki.openfoodfacts.org/Food_Traceability_Codes/EU_Food_establishments';

	import EcoScore from './GreenScore.svelte';
	import NutriScore from './NutriScore.svelte';
	import Nova from './Nova.svelte';

	import KnowledgePanels from '$lib/knowledgepanels/Panels.svelte';
	import Folksonomy from './Folksonomy.svelte';
	import Card from '$lib/ui/Card.svelte';
	import Debug from '$lib/ui/Debug.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';

	import type { PageData } from './$types';
	import Prices from './Prices.svelte';
	import Gs1Country from './GS1Country.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let product = $derived(data.state.product);

	let lang = $derived($preferences.lang);
</script>

<svelte:head>
	<title>{product.product_name ?? product.code} | Open Food Facts</title>
</svelte:head>

<Card>
	<div class="items-center gap-2 max-md:mb-4 max-md:text-center md:flex">
		<h1 class="my-4 grow text-2xl font-bold md:text-4xl">
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

		<a
			href={`/products/${product.code}/edit`}
			class="btn btn-secondary max-sm:btn-sm ml-auto"
			class:pointer-events-none={navigating.to}
		>
			{#if navigating.to?.params?.barcode === product.code}
				<span class="loading loading-ring loading-lg mx-auto my-auto"></span>
			{:else}
				Edit
			{/if}
		</a>
	</div>

	<div class="flex flex-col-reverse gap-4 md:flex-row">
		<div class="grid h-max w-full grid-cols-[max-content_1fr] gap-x-4 gap-y-1 md:w-3/4">
			<span class="text-end font-bold">Quantity:</span>
			<span>{product.quantity}</span>

			<span class="text-end font-bold">Brands:</span>
			<span>
				{#await data.taxo.brands}
					Loading...
				{:then brands}
					{#each product.brands_tags as tag, i (i)}
						{#if i > 0},
						{/if}
						{brands[tag] != null ? getOrDefault(brands[tag].name, lang) : tag}
					{/each}
				{/await}
			</span>

			<span class="text-end font-bold">Categories:</span>
			<span class="flex flex-wrap gap-1">
				{#await data.taxo.categories}
					Loading...
				{:then categories}
					{#each product.categories_tags as tag (tag)}
						<a
							class="link bg-secondary mr-0.5 inline-block break-inside-avoid rounded-xl px-2 font-semibold text-black no-underline"
							href="/taxo/categories/{tag}"
						>
							{categories[tag] != null ? getOrDefault(categories[tag].name, lang) : tag}
						</a>
					{/each}
				{/await}
			</span>

			<span class="text-end font-bold">Stores:</span>
			<span>
				{#await data.taxo.stores}
					Loading...
				{:then stores}
					{#each product.stores_tags as tag, i (i)}
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
					{#each product.labels_tags as tag, i (i)}
						{#if i > 0},
						{/if}
						<a class="link" href={'/taxo/labels/' + tag}>
							{labels[tag] != null ? getOrDefault(labels[tag].name, lang) : tag}
						</a>
					{/each}
				{/await}
			</span>

			<span class="text-end font-bold">Countries:</span>
			<span>
				{#await data.taxo.countries}
					Loading...
				{:then countries}
					{#each product.countries_tags as tag, i (tag)}
						{#if i > 0},
						{/if}
						<a class="link" href={'/taxo/countries/' + tag}>
							{countries[tag] != null ? getOrDefault(countries[tag].name, lang) : tag}
						</a>
					{/each}
				{/await}
			</span>

			<span class="text-end font-bold">Origins:</span>
			<span>
				{#await data.taxo.origins}
					Loading...
				{:then origins}
					{#each product.origins_tags as tag, i (i)}
						{#if i > 0},
						{/if}
						<a class="link" href={'/taxo/origin/' + tag}>
							{origins[tag] != null ? getOrDefault(origins[tag].name, lang) : tag}
						</a>
					{/each}
				{/await}
			</span>

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

		<div class="flex max-h-56 grow justify-center">
			<ImageButton src={product.image_front_url} alt={product.product_name} />
		</div>
	</div>
</Card>

<div class="flex w-full justify-between gap-3 max-md:flex-col lg:max-h-32">
	<a href="#health_card" class="md:w-1/3">
		<NutriScore grade={product.nutriscore_grade} />
	</a>
	<a href="#nutrition_card" class="md:w-1/3">
		<Nova grade={product.nova_group} />
	</a>
	<a href="#environment_card" class="md:w-1/3">
		<EcoScore grade={product.ecoscore_grade} />
	</a>
</div>

<KnowledgePanels knowledgePanels={product.knowledge_panels} productCode={product.code} />

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
