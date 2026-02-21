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
	import BarcodeCorrectionCard from '$lib/ui/BarcodeCorrectionCard.svelte';
	import { preferences } from '$lib/settings';

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
		description: 'Show product barcode',
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

	{#if product.code != null && ($userInfo?.isModerator || $preferences.moderator)}
		<BarcodeCorrectionCard currentCode={product.code} />
	{/if}

	<robotoff-contribution-message product-code={product.code} is-logged-in={$userInfo != null}
	></robotoff-contribution-message>

	{#await productAttributes}
		<div class="flex items-center justify-center py-8">
			<span class="loading loading-spinner loading-lg"></span>
			<span class="ml-2">Loading product attributes...</span>
		</div>
	{:then attributes}
		{#if attributes != null}
			<ProductAttributes groups={attributes} defaultPreferences={data.defaultProductPreferences} />
		{:else}
			<div class="alert alert-warning">
				<IconMdiWarning class="h-6 w-6 shrink-0" />
				<div>
					<h3 class="font-bold">Unable to load personalized attributes</h3>
					<p>
						There was an error while loading the personalized attributes. Please try again later.
					</p>
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
				Use the Web Component Editor
			</label>

			{#if useWCFolksonomyEditor}
				<folksonomy-editor page-type="edit" product-code={product.code}></folksonomy-editor>
			{:else}
				<h1 class="my-4 text-4xl font-bold">Personalized properties (beta)</h1>

				<div class="prose my-4 text-justify">
					<p>
						These properties are created and filled by users for any kind of usages. Feel free to
						add your own. The properties and values you create
						<strong>must be factual</strong>. You can dive into
						<a href="https://openfoodfacts-explorer.vercel.app/folksonomy">
							the list of properties already used by the community
						</a>
						or explore the
						<a href="https://wiki.openfoodfacts.org/Folksonomy/Property">
							properties' documentation and its search engine
						</a>.
					</p>
					<p>Be aware the data model might be modified. Use at your own risk.</p>
					<p>
						This is brought by the
						<a href="https://wiki.openfoodfacts.org/Folksonomy_Engine">Folksonomy Engine project</a
						>. Don't hesitate to participate or give feedback.
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
