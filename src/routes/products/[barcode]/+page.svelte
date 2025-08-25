<script lang="ts">
	import { isConfigured as isPriceConfigured } from '$lib/api/prices';
	import { isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
	import { _ } from '$lib/i18n';

	import KnowledgePanels from '$lib/knowledgepanels/Panels.svelte';
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

	type Props = { data: PageData };

	let { data }: Props = $props();
	let { state: productState, productAttributes } = $derived(data);
	let { product } = $derived(productState);

	let websiteCtx = getWebsiteCtx();
	$effect(() => {
		websiteCtx.flavor = product.product_type as 'beauty' | 'food' | 'petfood' | 'product';
	});

	let useWCFolksonomyEditor = $state(false);
</script>

<Metadata
	title={$_('product.title', { values: { productName: product.product_name } })}
	description={$_('product.description', { values: { productName: product.product_name } })}
	imageUrl={product.image_front_small_url ?? product.image_front_url}
/>

<div class="flex flex-col gap-4">
	<ProductHeader {product} taxonomies={data.taxo} />

	<robotoff-contribution-message product-code={product.code} is-logged-in={$userInfo != null}
	></robotoff-contribution-message>

	<ProductAttributes {productAttributes} />

	<KnowledgePanels
		knowledgePanels={product.knowledge_panels}
		productCode={product.code}
		onlyCards={true}
	/>

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
