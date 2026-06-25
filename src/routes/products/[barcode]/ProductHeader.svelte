<script lang="ts">
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { _ } from '$lib/i18n';
	import { shareContent } from '$lib/utils/webShare';

	import { navigating } from '$app/state';
	import {
		type Brand,
		type Category,
		type Country,
		type Label,
		type Origin,
		type Store,
		type Taxonomy
	} from '$lib/api';
	import { PRODUCT_REPORT_URL, PRODUCT_WEBSITE_URL, TRACEABILITY_CODES_URL } from '$lib/const';
	import TagChipList from '$lib/ui/TagChipList.svelte';
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

	let toastCtx = getToastCtx();
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
		await shareContent(
			{
				url: `${window.location.origin}${window.location.pathname}`,
				title: product.product_name || product.code,
				text: $_('product.share_text', {
					values: { productName: product.product_name || product.code }
				})
			},
			{
				onClipboard: () => toastCtx.success($_('product.toast.copied_link')),
				onError: () => toastCtx.error($_('product.toast.failed_copy'))
			}
		);
	}

	let frontImage = $derived(
		'image_front_url' in product ? (product.image_front_url as string) : undefined
	);

	let productWebsiteUrl = $derived(PRODUCT_WEBSITE_URL(product.code!, product.product_type));

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
						href={productWebsiteUrl}
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

					<button
						class="btn btn-secondary btn-sm md:btn-md flex items-center gap-2"
						onclick={sharePage}
					>
						<IconMdiShareVariant class="h-5 w-5" />
						<span class="hidden md:block">{$_('product.buttons.share')}</span>
					</button>

					<a
						class="btn btn-secondary btn-sm md:btn-md flex items-center gap-2"
						href={PRODUCT_REPORT_URL(product.code!, product.product_type)}
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
				<TagChipList
					title={$_('product.header.brands')}
					tags={product.brands_tags}
					taxonomyPromise={taxonomies.brands}
					facetType="brands"
				/>

				<!-- Categories -->
				<TagChipList
					title={$_('product.header.categories')}
					tags={product.categories_tags}
					taxonomyPromise={taxonomies.categories}
					facetType="categories"
				/>

				<!-- Labels -->
				<TagChipList
					title={$_('product.header.labels')}
					tags={product.labels_tags}
					taxonomyPromise={taxonomies.labels}
					facetType="labels"
				/>

				<!-- Origins -->
				<TagChipList
					title={$_('product.header.origins')}
					tags={product.origins_tags as unknown as string[]}
					taxonomyPromise={taxonomies.origins}
					facetType="origin"
				/>

				<!-- Traceability Codes -->
				{#if product.emb_codes_tags != null && product.emb_codes_tags.length > 0}
					<div class="mb-2">
						<div class="text-secondary mb-2 text-sm font-bold">
							<span>{$_('product.header.traceability_codes')}</span>
							<a
								href={TRACEABILITY_CODES_URL}
								target="_blank"
								rel="noopener noreferrer"
								class="link link-secondary text-xs"
							>
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

				<!-- Stores -->
				<TagChipList
					title={$_('product.header.stores')}
					tags={product.stores_tags}
					taxonomyPromise={taxonomies.stores}
				/>

				<!-- Countries -->
				<TagChipList
					title={$_('product.header.countries')}
					tags={product.countries_tags}
					taxonomyPromise={taxonomies.countries}
					facetType="countries"
				/>
			</div>
		</div>
	</div>
</Card>
