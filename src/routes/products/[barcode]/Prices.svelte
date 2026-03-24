<script lang="ts">
	import { onMount } from 'svelte';

	import { _ } from '$lib/i18n';

	import Card from '$lib/ui/Card.svelte';
	import type { PriceFull } from '@openfoodfacts/openfoodfacts-nodejs';

	let PricesMap: Promise<typeof import('./PricesMap.svelte').default> | null = $state(null);

	let { prices, barcode }: { barcode: string; prices: PriceFull[] } = $props();

	onMount(() => {
		(async () => {
			if (PricesMap == null) {
				PricesMap = import('./PricesMap.svelte').then((module) => module.default);
			}
		})();

		return () => {
			PricesMap = null; // Cleanup on unmount
		};
	});
</script>

<Card>
	<h1 class="my-4 text-2xl font-bold sm:text-4xl">Prices Map</h1>

	{#if prices.length === 0}
		{$_('product.prices.no_prices_found')}
	{:else if PricesMap == null}
		{$_('product.prices.loading')}
	{:else}
		{#await PricesMap}
			{$_('product.prices.loading')}
		{:then PricesMap}
			<PricesMap {prices} />
		{/await}
	{/if}

	<div class="mt-4 text-end">
		<a
			href="https://prices.openfoodfacts.org/products/{barcode}"
			class="text-secondary link text-sm italic"
			target="_blank"
			rel="noopener noreferrer"
		>
			{$_('product.prices.view_prices')}
		</a>
	</div>
</Card>
