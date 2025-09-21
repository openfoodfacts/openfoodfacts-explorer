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

	import type { PageData } from './$types';
	import Prices from './Prices.svelte';
	import { userInfo } from '$lib/stores/pkceLoginStore';
	import { getWebsiteCtx } from '$lib/stores/website';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import type { KnowledgePanels } from '$lib/api';

	type Props = { data: PageData };

	let { data }: Props = $props();
	let { state: productState, productAttributes } = $derived(data);

	// TODO: Remove the casts once the external types are fixed
	let product = $derived(
		productState.product as Product & {
			// mandatory fields
			code: string;
			created_t: string;
			creator: string;
			last_modified_t: string;
			last_editor: string;
			// optional fields
			knowledge_panels: KnowledgePanels;
			taxonomies?: string[];
			image_front_small_url?: string;
			image_front_url?: string;
		}
	);

	let websiteCtx = getWebsiteCtx();
	$effect(() => {
		// Update website context based on product type
		if (product.product_type) websiteCtx.flavor = product.product_type;
	});

	let useWCFolksonomyEditor = $state(false);
</script>

<!-- FIXME: Remove this cast once product.image_front_small_url and product.image_front_url are not nullable in the API -->
<Metadata
	title={$_('product.title', { values: { productName: product.product_name } })}
	description={$_('product.description', { values: { productName: product.product_name } })}
	imageUrl={product.image_front_small_url ?? product.image_front_url ?? undefined}
/>

<div class="flex flex-col gap-4">
	<ProductHeader {product} taxonomies={data.taxo} />

	<robotoff-contribution-message product-code={product.code} is-logged-in={$userInfo != null}
	></robotoff-contribution-message>

	<ProductAttributes
		groups={productAttributes}
		defaultPreferences={data.defaultProductPreferences}
	/>

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
