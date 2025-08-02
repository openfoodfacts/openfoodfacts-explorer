<script lang="ts">
	import { onMount } from 'svelte';

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

	let PricesMap: typeof import('./PricesMap.svelte').default | null = $state(null);

	import type { PageData } from './$types';

	type Props = { data: PageData };

	let { data }: Props = $props();
	let product = $derived(data.state.product);
	let productAttributes = $derived(data.productAttributes);

	onMount(() => {
		(async () => {
			if (isPriceConfigured() && data?.prices != null && PricesMap == null) {
				PricesMap = (await import('./PricesMap.svelte')).default;
			} else {
				PricesMap = null;
			}
		})();

		return () => {
			PricesMap = null; // Cleanup on unmount
		};
	});
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

	{#if PricesMap != null && isPriceConfigured() && data?.prices != null}
		<Card>
			<h1 class="my-4 text-2xl font-bold sm:text-4xl">Prices Map</h1>

			<PricesMap prices={data.prices} barcode={product.code} />
		</Card>
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
