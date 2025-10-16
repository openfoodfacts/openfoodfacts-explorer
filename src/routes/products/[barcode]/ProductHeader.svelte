<script lang="ts">
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

	import { navigating } from '$app/state';
	import {
		getOrDefault,
		type Brand,
		type Category,
		type Country,
		type Label,
		type Origin,
		type Store,
		type Taxonomy
	} from '$lib/api';
	import { PRODUCT_REPORT_URL, TRACEABILITY_CODES_URL } from '$lib/const';
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

	let isShareSupported = $derived(navigator?.share != null);

	function addToCalculator() {
		// FIXME: product.code cannot be null
		const code = product.code!;

		addItemToCalculator({
			id: code,
			name: product.product_name || code,
			quantity: 100,
			// @ts-expect-error - image_front_small_url cannot be null
			imageUrl: product.image_front_small_url,
			// @ts-expect-error - FIXME: maybe deprecated but the JSON response has this field
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

	let frontImage = $derived(
		'image_front_url' in product ? (product.image_front_url as string) : undefined
	);
</script>

<Card>
	<div
		class="flex flex-col gap-2 max-md:mb-4 max-md:text-center md:flex-row md:items-center md:justify-between"
	>
		<h1 class="my-4 grow text-3xl leading-tight font-bold break-words md:text-4xl">
			{product.product_name ?? '[' + product.code + ']'}
		</h1>

		<div class="flex flex-wrap items-center justify-center gap-2 md:justify-end">
			<a
				href={'https://world.openfoodfacts.org/product/' + product.code}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-secondary"
			>
				Classic view
			</a>

			<a
				href={`/products/${product.code}/edit`}
				class="btn btn-secondary"
				class:pointer-events-none={navigating.to}
			>
				<span class="icon-[mdi--pencil] h-5 w-5"></span>
				<span class="hidden md:block"> Edit </span>
			</a>

			{#if isShareSupported}
				<button class="btn btn-secondary flex items-center gap-2" onclick={sharePage}>
					<span class="icon-[mdi--share-variant] h-5 w-5"></span>
					<span class="hidden md:block">Share</span>
				</button>
			{/if}

			<a
				class="btn btn-secondary flex items-center gap-2"
				href={PRODUCT_REPORT_URL(product.code!)}
				target="_blank"
				rel="noopener noreferrer"
				title="Report an issue with this product"
				aria-label="Report an issue with this product"
			>
				<span class="icon-[mdi--flag] h-5 w-5"></span>
			</a>

			<button
				class="btn btn-secondary"
				onclick={addToCalculator}
				title="Add product to nutritional calculator"
				aria-label="Add product to nutritional calculator"
			>
				<span class="icon-[mdi--calculator] h-5 w-5"></span>
			</button>
		</div>
	</div>

	<div class="flex flex-col-reverse gap-4 md:flex-row">
		<div class="grid h-max w-full gap-3 md:w-3/4">
			<!-- Quantity -->
			<div class="mb-2">
				<div class="text-secondary mb-1 text-sm font-bold">Quantity</div>
				<div>{product.quantity}</div>
			</div>

			<!-- Brands -->
			<div class="mb-2">
				<div class="text-secondary mb-1 text-sm font-bold">Brands</div>
				<div class="flex flex-wrap gap-1">
					{#await taxonomies.brands}
						Loading...
					{:then brands}
						{#each product.brands_tags ?? [] as tag, i (i)}
							<a class="badge h-auto break-words" href="/facets/brands/{tag}">
								{localizedTaxoName(brands, tag)}
							</a>
						{/each}
					{/await}
				</div>
			</div>

			<!-- Categories -->
			<div class="mb-2">
				<div class="text-secondary mb-1 text-sm font-bold">Categories</div>
				<div class="flex flex-wrap gap-1">
					{#await taxonomies.categories}
						Loading...
					{:then categories}
						{#each product.categories_tags ?? [] as tag (tag)}
							<a class="badge badge-secondary h-auto break-words" href="/facets/categories/{tag}">
								{localizedTaxoName(categories, tag)}
							</a>
						{/each}
					{/await}
				</div>
			</div>

			<!-- Labels -->
			<div class="mb-2">
				<div class="text-secondary mb-1 text-sm font-bold">Labels</div>
				<div class="flex flex-wrap gap-1">
					{#await taxonomies.labels}
						Loading...
					{:then labels}
						{#each product.labels_tags ?? [] as tag, i (i)}
							<a class="badge h-auto break-words" href="/facets/labels/{tag}">
								{localizedTaxoName(labels, tag)}
							</a>
						{/each}
					{/await}
				</div>
			</div>

			<!-- Origins -->
			{#if product.origins_tags != null && product.origins_tags.length > 0}
				<div class="mb-2">
					<div class="text-secondary mb-1 text-sm font-bold">Origins</div>
					<div class="flex flex-wrap gap-1">
						{#await taxonomies.origins}
							Loading...
						{:then origins}
							<!-- FIXME: the type override is needed because product.origins_tags results as Record<string, unknown> -->
							{#each (product.origins_tags as unknown as string[]) ?? [] as tag, i (i)}
								{#if i > 0},
								{/if}
								<a class=" badge h-auto break-words" href="/facets/origin/{tag}">
									{localizedTaxoName(origins, tag)}
								</a>
							{/each}
						{/await}
					</div>
				</div>
			{/if}

			<!-- Traceability Codes -->
			{#if product.emb_codes_tags != null && product.emb_codes_tags.length > 0}
				<div class="mb-2">
					<div class="text-secondary mb-1 text-sm font-bold">Traceability Codes</div>

					<div class="flex flex-wrap items-center gap-2">
						{#each product.emb_codes_tags as tag, i (i)}
							{#if i > 0},
							{/if}
							<a
								class="link inline-flex items-center break-words"
								href="/facets/packager-codes/{tag}"
							>
								{tag}
							</a>
						{/each}
					</div>

					<div class="text-secondary text-sm">
						{product.emb_codes}
						<a href={TRACEABILITY_CODES_URL} target="_blank" class="ml-2 text-xs text-gray-500">
							(Learn more)
						</a>
					</div>
				</div>
			{/if}

			{#if product.link != null}
				<div class="mb-2">
					<div class="text-secondary mb-1 text-sm font-bold">Producer link</div>
					<a
						class="link break-words"
						href={product.link}
						target="_blank"
						rel="noopener noreferrer"
						title="View product on Open Food Facts"
						aria-label="View product on Open Food Facts"
					>
						{product.link}
					</a>
				</div>
			{/if}

			<div class="mb-2">
				<div class="text-secondary mb-1 text-sm font-bold">Stores</div>
				<div class="flex flex-wrap gap-1">
					{#await taxonomies.stores}
						Loading...
					{:then stores}
						{#each product.stores_tags ?? [] as tag, i (i)}
							<span class="badge h-auto break-words">
								{localizedTaxoName(stores, tag)}
							</span>
						{/each}
					{/await}
				</div>
			</div>

			<div class="mb-2">
				<div class="text-secondary mb-1 text-sm font-bold">Countries</div>
				<div class="flex flex-wrap gap-1">
					{#await taxonomies.countries}
						Loading...
					{:then countries}
						{#each product.countries_tags ?? [] as tag, i (i)}
							<a class="badge h-auto break-words" href="/facets/countries/{tag}">
								{localizedTaxoName(countries, tag)}
							</a>
						{/each}
					{/await}
				</div>
			</div>
		</div>

		<div
			class="m-4 flex h-auto min-h-[40vh] items-start justify-center max-md:min-h-[30vh] md:w-1/4"
		>
			<ImageButton src={frontImage} alt={product.product_name} />
		</div>
	</div>
</Card>
