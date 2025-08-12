<script lang="ts">
	import { isConfigured as isPriceConfigured } from '$lib/api/prices';
	import { isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
	import { _ } from '$lib/i18n';

	import KnowledgePanels from '$lib/knowledgepanels/Panels.svelte';
	import Card from '$lib/ui/Card.svelte';
	import Debug from '$lib/ui/Debug.svelte';
	import Metadata from '$lib/Metadata.svelte';

	import ProductAttributes from './ProductAttributes.svelte';
	import Folksonomy from './Folksonomy.svelte';
	import DataSources from './DataSources.svelte';

	import Gs1Country from './GS1Country.svelte';
	import ProductHeader from './ProductHeader.svelte';

	import type { PageData } from './$types';
	import Prices from './Prices.svelte';

	type Props = { data: PageData };

	let { data }: Props = $props();
	let product = $derived(data.state.product);
	let productAttributes = $derived(data.productAttributes);
</script>

<Metadata
	title={$_('product.title', { values: { productName: product.product_name } })}
	description={$_('product.description', { values: { productName: product.product_name } })}
	imageUrl={product.image_front_small_url ?? product.image_front_url}
/>

<div class="flex flex-col gap-4">
	<ProductHeader {product} taxonomies={data.taxo} />

	<ProductAttributes {productAttributes} />

	<KnowledgePanels knowledgePanels={product.knowledge_panels} productCode={product.code} />

	{#if isPriceConfigured() && data?.prices != null}
		<Prices prices={data.prices} barcode={product.code} />
	{/if}

	<Gs1Country barcode={product.code} />

	<DataSources {product} />

	{#if isFolksonomyConfigured()}
		<Card>
			<h1 class="my-4 text-4xl font-bold">
				Folksonomy Engine <span class="font-light italic">(beta)</span>
			</h1>

			<Folksonomy
				tags={data.tags ?? []}
				keys={data.keys.map((it) => it.k)}
				barcode={product.code}
			/>
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
</div>
