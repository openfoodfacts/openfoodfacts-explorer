<script lang="ts">
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

	import type { PageProps } from './$types';
	import Prices from './Prices.svelte';
	import { userInfo } from '$lib/stores/user';
	import { getWebsiteCtx } from '$lib/stores/website';

	import IconMdiWarning from '@iconify-svelte/mdi/warning';

	import { OpenFoodFacts, type Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import type { KnowledgePanels } from '$lib/api/knowledgepanels';
	import NutritionCalculator from '$lib/ui/NutritionCalculator.svelte';
	import { getContext } from 'svelte';
	import type { Shortcut } from '../../Shortcuts.svelte';
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

	let shortcuts: Map<string, Shortcut> = getContext<() => Map<string, Shortcut>>('shortcuts')();
	shortcuts.set('Shift+B', {
		description: $_('product.shortcuts.show_barcode'),
		action: () => (showBarcode = !showBarcode)
	});

	async function getProductAttributes(code: string): Promise<ProductGroupedAttributes[]> {
		const offApi = new OpenFoodFacts(fetch);

		const searchParams: Record<string, unknown> = {
			fields: ['attribute_groups_en']
		};

		const SENT_ATTRIBUTES = ['attribute_unwanted_ingredients_tags'];

		for (const prefAttr of SENT_ATTRIBUTES) {
			const pref = $personalizedSearch.userPreferences.find((p) => p.attributeId === prefAttr);
			if (pref == null) {
				continue;
			}

			if (pref.type === 'attribute') {
				searchParams[pref.attributeId] = pref.value;
			} else if (pref.type === 'tags') {
				searchParams[pref.attributeId] = pref.value.join(',');
			}
		}

		const { data: prodData, error } = await offApi.apiv3.getProductV3(code, { ...searchParams });

		if (error) {
			console.error('Error fetching product attributes:', error);
			return [];
		} else if (prodData == null || prodData.status === 'failure') {
			console.warn('Product not found for code:', code);
			return [];
		} else if (prodData.product == null) {
			console.warn('Product data is null for code:', code);
			return [];
		}

		return prodData.product.attribute_groups_en as unknown as ProductGroupedAttributes[];
	}

	let productAttributes = $derived(getProductAttributes(product.code));
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
	{/if}

	<robotoff-contribution-message product-code={product.code} is-logged-in={$userInfo != null}
	></robotoff-contribution-message>

	{#await productAttributes}
		<div class="flex items-center justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
			<span class="ml-2">{$_('product.loading_attributes')}</span>
		</div>
	{:then attributes}
		{#if attributes != null}
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
				<folksonomy-editor page-type="edit" product-code={product.code}></folksonomy-editor>
			{:else}
				<h1 class="my-4 text-4xl font-bold">{$_('product.folksonomy.title_beta')}</h1>

				<div class="prose my-4 text-justify">
					<p>
						{$_('product.folksonomy.intro_before')}
						<strong>{$_('product.folksonomy.intro_emphasis')}</strong>
						{$_('product.folksonomy.intro_after')}
						<a href="https://openfoodfacts-explorer.vercel.app/folksonomy">
							{$_('product.folksonomy.link_properties')}
						</a>
						{$_('product.folksonomy.link_middle')}
						<a href="https://wiki.openfoodfacts.org/Folksonomy/Property">
							{$_('product.folksonomy.link_docs')}
						</a>.
					</p>
					<p>{$_('product.folksonomy.warning')}</p>
					<p>
						{$_('product.folksonomy.footer_before')}
						<a href="https://wiki.openfoodfacts.org/Folksonomy_Engine">
							{$_('product.folksonomy.footer_link')}
						</a>
						{$_('product.folksonomy.footer_after')}
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
