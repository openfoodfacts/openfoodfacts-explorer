<script lang="ts">
	import { browser } from '$app/environment';
	import { isConfigured as isPriceConfigured } from '$lib/api/prices';
	import { isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
	import { _ } from '$lib/i18n';

	import KnowledgePanelsComp from '$lib/knowledgepanels/Panels.svelte';
	import Card from '$lib/ui/Card.svelte';
	import Metadata from '$lib/Metadata.svelte';

	import ProductAttributes from './ProductAttributes.svelte';
	import Folksonomy from './Folksonomy.svelte';
	import DataSources from './DataSources.svelte';

	import Gs1Country from './GS1Country.svelte';
	import ProductHeader from './ProductHeader.svelte';
	import BarcodeInfo from '$lib/ui/BarcodeInfo.svelte';

	import ContextualLinks from '$lib/components/ContextualLinks.svelte';

	import type { PageProps } from './$types';
	import Prices from './Prices.svelte';
	import { userInfo } from '$lib/stores/user';
	import { userAuthTokens } from '$lib/stores/auth';
	import { getWebsiteCtx } from '$lib/stores/website';

	import IconMdiWarning from '@iconify-svelte/mdi/warning';

	import { OpenFoodFacts, type Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import type { KnowledgePanels } from '$lib/api/knowledgepanels';
	import NutritionCalculator from '$lib/ui/NutritionCalculator.svelte';
	import { getContext } from 'svelte';
	import { type Shortcut } from '$lib/stores/shortcuts';
	import type { ProductGroupedAttributes } from './types';
	import { personalizedSearch } from '$lib/stores/preferencesStore';

	let { data }: PageProps = $props();
	let { state: productState } = $derived(data);

	type UiProduct = Product & {
		code: string;
		created_t: number;
		creator: string;
		last_modified_t: number;
		last_editor: string;

		knowledge_panels: KnowledgePanels;
		image_front_small_url?: string;
		image_front_url?: string;
		taxonomies?: string[];
	};

	// TODO: Remove the casts once the external types are fixed
	let product = $derived(
		productState.status === 'success' ? (productState.product as UiProduct) : ({} as UiProduct)
	);

	let websiteCtx = getWebsiteCtx();
	$effect(() => {
		// Update website context based on product type
		if (product.product_type) websiteCtx.flavor = product.product_type;
	});

	let useWCFolksonomyEditor = $state(false);
	let showBarcode = $state(false);

	$effect(() => {
		if (browser) {
			const handleKeyDown = (event: KeyboardEvent) => {
				// Shift + B check
				if (event.shiftKey && event.key === 'B') {
					event.preventDefault();
					showBarcode = !showBarcode;
				}
			};

			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});

	async function getProductAttributes(code: string): Promise<ProductGroupedAttributes[]> {
		if (!browser || !code) return [];
		const offApi = new OpenFoodFacts(fetch);
		const searchParams: Record<string, unknown> = { fields: ['attribute_groups_en'] };
		const { data: prodData, error } = await offApi.apiv3.getProductV3(code, { ...searchParams });
		if (error || !prodData?.product) return [];
		return prodData.product.attribute_groups_en as unknown as ProductGroupedAttributes[];
	}

	let productAttributes = $derived.by(() => {
		if (browser && product?.code && product.code !== 'undefined') {
			return getProductAttributes(product.code);
		}
		return Promise.resolve([]);
	});
</script>

<!-- FIXME: Remove this cast once product.image_front_small_url and product.image_front_url are not nullable in the API -->
<Metadata
	title={$_('product.title', { values: { productName: product.product_name } })}
	description={$_('product.description', { values: { productName: product.product_name } })}
	imageUrl={product.image_front_small_url ?? product.image_front_url ?? undefined}
/>

<div class="flex flex-col gap-4">
	<ProductHeader {product} taxonomies={data.taxo} />

	{#if showBarcode && product.code != null}
		<BarcodeInfo code={product.code} />
		<div class="mt-2">
			<ContextualLinks barcode={product.code} />
		</div>
	{/if}

	<robotoff-contribution-message product-code={product.code} is-logged-in={$userInfo != null}
	></robotoff-contribution-message>

	{#await productAttributes}
		<div class="flex items-center justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
			<span class="ml-2">{$_('product.loading_attributes')}</span>
		</div>
	{:then attributes}
		{#if attributes != null && attributes.length > 0}
			<ProductAttributes groups={attributes} defaultPreferences={data.defaultProductPreferences} />
		{:else}
			<div class="alert alert-warning">
				<IconMdiWarning class="h-6 w-6 shrink-0" />
				<div>
					<h3 class="font-bold">{$_('product.attributes_error_title')}</h3>
					<p>{$_('product.attributes_error_body')}</p>
				</div>
			</div>
		{/if}
	{/await}

	<KnowledgePanelsComp panels={product.knowledge_panels} code={product.code} roots={['root']} />

	{#if isPriceConfigured() && data?.prices != null}
		<Prices prices={data.prices} barcode={product.code} />
	{/if}

	<Gs1Country barcode={product.code} />
	<DataSources {product} />

	{#if isFolksonomyConfigured()}
		<Card>
			<label class="label">
				<input class="toggle" type="checkbox" bind:checked={useWCFolksonomyEditor} />
				{$_('product.folksonomy.use_wc_editor')}
			</label>

			{#if useWCFolksonomyEditor}
				<!-- TODO: This solution is far from optimal. Embedding tokens into the DOM is a security risk -->
				<folksonomy-editor
					page-type="edit"
					product-code={product.code}
					auth-token={$userAuthTokens?.access_token ?? ''}
				></folksonomy-editor>
			{:else}
				<h1 class="my-4 text-4xl font-bold">{$_('product.folksonomy.title_beta')}</h1>
				<div class="prose my-4 text-justify">
					<p>
						{$_('product.folksonomy.intro_before')}
						<strong>{$_('product.folksonomy.intro_emphasis')}</strong>
						{$_('product.folksonomy.intro_after')}
					</p>
				</div>
				{#if data.tags != null && data.keys != null}
					<Folksonomy tags={data.tags ?? []} keys={data.keys} barcode={product.code!} />
				{/if}
			{/if}
		</Card>
	{/if}
</div>

<NutritionCalculator />
