<script lang="ts">
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { _ } from '$lib/i18n';

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
	import { compareStore } from '$lib/stores/compareStore';
	import { getToastCtx } from '$lib/stores/toasts';
	import Card from '$lib/ui/Card.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';

	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiShareVariant from '@iconify-svelte/mdi/share-variant';
	import IconMdiFlag from '@iconify-svelte/mdi/flag';
	import IconMdiCalculator from '@iconify-svelte/mdi/calculator';
	import IconMdiCompare from '@iconify-svelte/mdi/compare';

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

	let toastCtx = getToastCtx();

	let isShareSupported = $derived(navigator?.share != null);

	function addToCalculator() {
		// FIXME: product.code cannot be null
		const code = product.code!;

		addItemToCalculator({
			id: code,
			name: product.product_name || code,
			quantity: 100,
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

	function addToComparison() {
		// Convert Product to ProductReduced - using type assertion since the product exists
		const added = compareStore.addProduct(product);
		if (added) {
			toastCtx.success('Product added to comparison');
		} else {
			toastCtx.warning('Product is already in comparison or comparison is full');
		}
	}
</script>

{#snippet loadingTaxonomy()}
	<div class="skeleton h-6 w-full"></div>
{/snippet}

<Card>
	<div class="flex flex-col gap-6 md:flex-row-reverse md:gap-8">
		<!-- 1. Image Column (Visual Anchor) -->
		<!-- Left on Desktop, Top on Mobile -->
		<div
			class="mx-auto flex w-full max-w-[200px] shrink-0 items-start justify-center md:h-auto md:w-1/4 md:max-w-none"
		>
			<ImageButton src={frontImage} alt={product.product_name} productCode={product.code} />
		</div>

		<!-- 2. Content Column -->
		<div class="flex min-w-0 flex-1 flex-col gap-8">
			<!-- Header Section: Title & Actions -->
			<div class="flex flex-col gap-8">
				<h1
					class="text-center text-3xl leading-tight font-bold wrap-break-word md:text-left md:text-4xl"
				>
					{product.product_name ?? '[' + product.code + ']'}
				</h1>

				<!-- Action Toolbar -->
				<div class="flex shrink-0 flex-wrap items-center justify-center gap-2 md:justify-start">
					<a
						href={'https://world.openfoodfacts.org/product/' + product.code}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-secondary btn-sm md:btn-md"
					>
						{$_('product.buttons.classic_view')}
					</a>

					<a
						href={`/products/${product.code}/edit`}
						class="btn btn-secondary btn-sm md:btn-md"
						class:pointer-events-none={navigating.to}
					>
						<IconMdiPencil class="h-5 w-5" />
						<span class="hidden md:block"> {$_('product.buttons.edit')} </span>
					</a>

					{#if isShareSupported}
						<button
							class="btn btn-secondary btn-sm md:btn-md flex items-center gap-2"
							onclick={sharePage}
						>
							<IconMdiShareVariant class="h-5 w-5" />
							<span class="hidden md:block">{$_('product.buttons.share')}</span>
						</button>
					{/if}

					<a
						class="btn btn-secondary btn-sm md:btn-md flex items-center gap-2"
						href={PRODUCT_REPORT_URL(product.code!)}
						target="_blank"
						rel="noopener noreferrer"
						title={$_('product.buttons.report')}
						aria-label={$_('product.buttons.report')}
					>
						<IconMdiFlag class="h-5 w-5" />
					</a>

					<button
						class="btn btn-secondary btn-sm md:btn-md"
						onclick={addToCalculator}
						title={$_('product.buttons.add_to_calculator')}
						aria-label={$_('product.buttons.add_to_calculator')}
					>
						<IconMdiCalculator class="h-5 w-5" />
					</button>

					<button
						class="btn btn-secondary btn-sm md:btn-md"
						onclick={addToComparison}
						title={$_('product.buttons.compare')}
						aria-label={$_('product.buttons.compare')}
					>
						<IconMdiCompare class="h-5 w-5" />
					</button>
				</div>
			</div>

			<!-- Metadata Body -->
			<div class="flex flex-col gap-3 text-center md:text-left">
				<div class="mb-2">
					<div class="text-secondary mb-2 text-sm font-bold">{$_('product.header.quantity')}</div>
					<div>{product.quantity}</div>
				</div>

				<!-- Brands -->
				<div class="mb-2">
					<div class="text-secondary mb-2 text-sm font-bold">{$_('product.header.brands')}</div>
					<div class="flex flex-wrap justify-center gap-1 md:justify-start">
						{#await taxonomies.brands}
							{@render loadingTaxonomy()}
						{:then brands}
							{#each product.brands_tags ?? [] as tag, i (i)}
								<a class="badge wrap-break-word" href="/facets/brands/{tag}">
									{localizedTaxoName(brands, tag)}
								</a>
							{/each}
						{/await}
					</div>
				</div>

				<!-- Categories -->
				<div class="mb-2">
					<div class="text-secondary mb-2 text-sm font-bold">{$_('product.header.categories')}</div>
					<div class="flex flex-wrap justify-center gap-1 md:justify-start">
						{#await taxonomies.categories}
							{@render loadingTaxonomy()}
						{:then categories}
							{#each product.categories_tags ?? [] as tag (tag)}
								<a class="badge badge-secondary wrap-break-word" href="/facets/categories/{tag}">
									{localizedTaxoName(categories, tag)}
								</a>
							{/each}
						{/await}
					</div>
				</div>

				<!-- Labels -->
				<div class="mb-2">
					<div class="text-secondary mb-2 text-sm font-bold">{$_('product.header.labels')}</div>
					<div class="flex flex-wrap justify-center gap-1 md:justify-start">
						{#await taxonomies.labels}
							{@render loadingTaxonomy()}
						{:then labels}
							{#each product.labels_tags ?? [] as tag, i (i)}
								<a class="badge wrap-break-word" href="/facets/labels/{tag}">
									{localizedTaxoName(labels, tag)}
								</a>
							{/each}
						{/await}
					</div>
				</div>

				<!-- Origins -->
				{#if product.origins_tags != null && product.origins_tags.length > 0}
					<div class="mb-2">
						<div class="text-secondary mb-2 text-sm font-bold">{$_('product.header.origins')}</div>
						<div class="flex flex-wrap justify-center gap-1 md:justify-start">
							{#await taxonomies.origins}
								{@render loadingTaxonomy()}
							{:then origins}
								<!-- FIXME: the type override is needed because product.origins_tags results as Record<string, unknown> -->
								{#each (product.origins_tags as unknown as string[]) ?? [] as tag, i (i)}
									<a class="badge wrap-break-word" href="/facets/origin/{tag}">
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
						<div class="text-secondary mb-2 text-sm font-bold">
							<span>{$_('product.header.traceability_codes')}</span>
							<a href={TRACEABILITY_CODES_URL} target="_blank" class="link link-secondary text-xs">
								({$_('product.header.traceability_codes_learn_more')})
							</a>
						</div>

						<div class="flex flex-wrap items-center justify-center gap-2 md:justify-start">
							{#each product.emb_codes_tags as unknown as string[] as tag, i (i)}
								<a class="badge font-mono wrap-break-word" href="/facets/packager-codes/{tag}">
									{tag.toUpperCase()}
								</a>
							{/each}
						</div>
					</div>
				{/if}

				{#if product.link != null}
					<div class="mb-2">
						<div class="text-secondary mb-2 text-sm font-bold">
							{$_('product.header.producer_link')}
						</div>
						<a
							class="link break-all"
							href={product.link}
							target="_blank"
							rel="noopener noreferrer"
							title={$_('product.buttons.view_on_off')}
							aria-label={$_('product.buttons.view_on_off')}
						>
							{product.link}
						</a>
					</div>
				{/if}

				<div class="mb-2">
					<div class="text-secondary mb-2 text-sm font-bold">{$_('product.header.stores')}</div>
					<div class="flex flex-wrap justify-center gap-1 md:justify-start">
						{#await taxonomies.stores}
							{@render loadingTaxonomy()}
						{:then stores}
							{#each product.stores_tags ?? [] as tag, i (i)}
								<span class="badge wrap-break-word">
									{localizedTaxoName(stores, tag)}
								</span>
							{/each}
						{/await}
					</div>
				</div>

				<div class="mb-2">
					<div class="text-secondary mb-2 text-sm font-bold">{$_('product.header.countries')}</div>
					<div class="flex flex-wrap justify-center gap-1 md:justify-start">
						{#await taxonomies.countries}
							{@render loadingTaxonomy()}
						{:then countries}
							{#each product.countries_tags ?? [] as tag, i (i)}
								<a class="badge wrap-break-word" href="/facets/countries/{tag}">
									{localizedTaxoName(countries, tag)}
								</a>
							{/each}
						{/await}
					</div>
				</div>
			</div>
		</div>
	</div>
</Card>
