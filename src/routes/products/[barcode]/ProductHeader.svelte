<script lang="ts">
	import { navigating } from '$app/state';
	import {
		getOrDefault,
		type Brand,
		type Category,
		type Country,
		type Label,
		type Origin,
		type Product,
		type Store,
		type Taxonomy
	} from '$lib/api';
	import { TRACEABILITY_CODES_URL } from '$lib/const';
	import { preferences } from '$lib/settings';
	import { addItemToCalculator, extractNutriments } from '$lib/stores/calculatorStore';
	import Card from '$lib/ui/Card.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';

	type Props = {
		product: Product;
		taxonomies: {
			brands: Promise<Taxonomy<Brand>>;
			categories: Promise<Taxonomy<Category>>;
			stores: Promise<Taxonomy<Store>>;
			labels: Promise<Taxonomy<Label>>;
			countries: Promise<Taxonomy<Country>>;
			origins: Promise<Taxonomy<Origin>>;
		};
	};
	let { product, taxonomies }: Props = $props();

	let { lang } = $derived($preferences);

	let isShareSupported = navigator?.share != null;

	function addToCalculator() {
		addItemToCalculator({
			id: product.code,
			name: product.product_name || product.code,
			quantity: 100,
			imageUrl: product.image_front_small_url,
			nutriments: extractNutriments(product.nutriments)
		});
	}

	async function sharePage() {
		try {
			await navigator.share({
				url: window.location.href
			});
		} catch (error) {
			console.error('Error sharing the page:', error);
		}
	}

	function localizedTaxoName(taxonomy: Taxonomy, tag: string) {
		return taxonomy[tag] != null ? getOrDefault(taxonomy[tag].name, lang) : tag;
	}
</script>

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
				class="btn btn-secondary max-sm:btn-sm"
			>
				Classic view
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
				<button class="btn btn-secondary max-sm:btn-sm flex items-center gap-2" onclick={sharePage}>
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
				{#await taxonomies.brands}
					Loading...
				{:then brands}
					{#each product.brands_tags as tag, i (i)}
						<a class="badge h-auto break-words" href="/facets/brands/{tag}">
							{localizedTaxoName(brands, tag)}
						</a>
					{/each}
				{/await}
			</div>

			<span class="text-end font-bold">Categories:</span>
			<div class="flex flex-wrap gap-1">
				{#await taxonomies.categories}
					Loading...
				{:then categories}
					{#each product.categories_tags as tag (tag)}
						<a class="badge badge-secondary h-auto break-words" href="/facets/categories/{tag}">
							{localizedTaxoName(categories, tag)}
						</a>
					{/each}
				{/await}
			</div>

			<span class="text-end font-bold">Stores:</span>
			<div class="flex flex-wrap gap-1">
				{#await taxonomies.stores}
					Loading...
				{:then stores}
					{#each product.stores_tags as tag, i (i)}
						<span class="badge h-auto break-words">
							{localizedTaxoName(stores, tag)}
						</span>
					{/each}
				{/await}
			</div>

			<span class="text-end font-bold">Labels:</span>
			<div class="flex flex-wrap gap-1">
				{#await taxonomies.labels}
					Loading...
				{:then labels}
					{#each product.labels_tags as tag, i (i)}
						<a class="badge h-auto break-words" href="/facets/labels/{tag}">
							{localizedTaxoName(labels, tag)}
						</a>
					{/each}
				{/await}
			</div>

			<span class="text-end font-bold">Countries:</span>
			<div class="flex flex-wrap gap-1">
				{#await taxonomies.countries}
					Loading...
				{:then countries}
					{#each product.countries_tags as tag, i (i)}
						<a class="badge h-auto break-words" href="/facets/countries/{tag}">
							{localizedTaxoName(countries, tag)}
						</a>
					{/each}
				{/await}
			</div>

			<span class="text-end font-bold">Origins:</span>
			<div class="flex flex-wrap gap-1">
				{#await taxonomies.origins}
					Loading...
				{:then origins}
					{#each product.origins_tags as tag, i (i)}
						{#if i > 0},
						{/if}
						<a class="link inline-flex items-center break-words" href="/facets/origin/{tag}">
							{localizedTaxoName(origins, tag)}
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

		<div class="m-4 flex h-auto min-h-[40vh] grow justify-center max-md:min-h-[30vh]">
			<ImageButton src={product.image_front_url} alt={product.product_name} />
		</div>
	</div>
</Card>
