<script lang="ts">
	import { onMount } from 'svelte';

	import { _ } from '$lib/i18n';
	import { OPEN_PRICES_PRODUCTS_URL, OPEN_PRICES_BASE_URL } from '$lib/const';

	import Card from '$lib/ui/Card.svelte';
	import type { PriceFull } from '@openfoodfacts/openfoodfacts-nodejs';

	let PricesMap: Promise<typeof import('./PricesMap.svelte').default> | null = $state(null);

	let { prices, barcode }: { barcode: string; prices: PriceFull[] } = $props();

	let count = $derived(prices.length);
	let uniqueStores = $derived(
		new Set(prices.map((p: PriceFull) => p.location_id || p.location?.id).filter(Boolean)).size
	);

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
	<h1 class="my-4 text-2xl font-bold sm:text-4xl">
		{$_('product.prices.title', { default: 'Prices' })}
	</h1>

	<p class="mb-4 text-sm text-secondary italic">
		{#if count > 0}
			{$_('product.prices.kp_subtitle_found', {
				default:
					'{count, plural, one {{count} price} other {{count} prices}} found in {storeCount, plural, one {{storeCount} store} other {{storeCount} stores}}',
				values: { count, storeCount: uniqueStores }
			})}
		{:else}
			{$_('product.prices.no_prices_found', {
				default: 'No prices found for this product'
			})}
		{/if}
	</p>

	{#if count === 0}
		<div class="my-4 rounded-lg border border-base-300 bg-base-200 p-6 text-center">
			<p class="text-base-content/70">
				{$_('product.prices.no_prices_explanation', {
					default:
						'Help us build the biggest Open Prices database by adding price information for this product.'
				})}
			</p>
		</div>
	{:else if PricesMap == null}
		<div
			class="flex h-80 w-full skeleton items-center justify-center rounded-lg text-base-content/50"
		>
			<span class="loading mr-2 loading-md loading-spinner"></span>
			{$_('product.prices.loading_map', { default: 'Loading prices map…' })}
		</div>
	{:else}
		{#await PricesMap}
			<div
				class="flex h-80 w-full skeleton items-center justify-center rounded-lg text-base-content/50"
			>
				<span class="loading mr-2 loading-md loading-spinner"></span>
				{$_('product.prices.loading_map', { default: 'Loading prices map…' })}
			</div>
		{:then PricesMap}
			<PricesMap {prices} />
		{/await}
	{/if}

	<div class="mt-4 flex flex-wrap items-center justify-between gap-4">
		<a
			href={`${OPEN_PRICES_BASE_URL}/prices/add/single?code=${barcode}`}
			class="btn btn-primary btn-sm"
			target="_blank"
			rel="noopener noreferrer"
		>
			{$_('product.knowledge_panels.action.add_price', { default: 'Add a price' })}
		</a>
		<a
			href={OPEN_PRICES_PRODUCTS_URL(barcode)}
			class="link text-sm text-secondary italic"
			target="_blank"
			rel="noopener noreferrer"
		>
			{$_('product.prices.view_prices')}
		</a>
	</div>
</Card>
