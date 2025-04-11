<script lang="ts">
	import { PricesApi, type Prices } from '$lib/api/prices';
	import { onMount } from 'svelte';
	import { getNearStores, type OverpassAPIResult } from '$lib/location';
	import { invalidateAll } from '$app/navigation';
	import Card from '$lib/ui/Card.svelte';
	import { _ } from '$lib/i18n';
	import type { components } from '$lib/api/prices.d';
	type CurrencyEnum = components['schemas']['CurrencyEnum'];
	type Item = components['schemas']["PriceFull"]
	



	interface Props {
		prices: {
        items: Item[];
        page: number;
         pages: number;
        size: number;
        total: number;
};
		barcode: string;
	}

	let { prices, barcode }: Props = $props();

	let pricesApi: PricesApi;
	let authenticated: boolean = $state(false);
	let nearStores: OverpassAPIResult | undefined = $state();
	let errorMessage: string | null = $state(null);
	let successMessage: string | null = $state(null);
	let selectedPriceId: number | null = $state(null);
	

	let editPrice = $state({
		value: 0 as number | null, // Allow null since price can be null
		currency: 'EUR' as CurrencyEnum,
		osm_id: 0 as number | null, // Allow null since location_osm_id can be null
		date: '' as string | null // Allow null since date can be null
	});

	onMount(async () => {
		pricesApi = new PricesApi(fetch);
		authenticated = await pricesApi.isAuthenticated();
		nearStores = await getNearStores();
		if (prices.items.length > 0) {
			selectedPriceId = prices.items[0].id;
		}
	});

	$effect(() => {
		if (selectedPriceId) {
			selectPrice(selectedPriceId);
		}
	});

	function selectPrice(id: number) {
		const price = prices.items.find((p) => p.id === id);
		if (!price) return;

		editPrice = {
			value: price.price ?? 0, // Default to 0 if null
			// @ts-expect-error - TODO: Types should be specified in a better way
			currency: price.currency ?? '', // Default to empty string if null
			osm_id: price.location_osm_id ?? 0, // Default to 0 if null
			date: price.date ?? '' // Default to empty string if null
		};
		errorMessage = null;
		successMessage = null;
	}

	async function updatePrice() {
		if (!selectedPriceId || false) return;

		const type = nearStores?.elements.find((el) => el.id === editPrice.osm_id)?.type?.toUpperCase();
		if (!type) {
			errorMessage = "Couldn't find store type";
			return;
		}

		const res = await pricesApi.updatePrice(selectedPriceId, {
			product_code: barcode,
			price: editPrice.value,
			currency: editPrice.currency,
			date: editPrice.date,
			location_osm_id: editPrice.osm_id,
			location_osm_type: type as 'NODE' | 'WAY' | 'RELATION'
		});


		if (res.error != null) {
			// @ts-expect-error - TODO: Types should be specified in a better way
			errorMessage = 'Error while updating price: ' + res.error.message;
			// @ts-expect-error - TODO: Types should be specified in a better way
			console.error('Error while updating price', res.error);
		} else {
			successMessage = 'Price updated successfully';
			console.debug('Updated price', res.data);
			const index = prices.items.findIndex((p) => p.id === selectedPriceId);
			if (index !== -1) {
				// @ts-expect-error - TODO: Types should be specified in a better way
				prices.items[index] = res.data;
				invalidateAll();
			}
			setTimeout(() => {
				successMessage = null;
			}, 2000);
		}
	}
</script>

<Card>
	<h3 class="mb-4 text-3xl font-bold">{$_('product.prices.edit_price')}</h3>

	{#if !authenticated}
		<div class="alert alert-warning mb-4">{$_('product.prices.log_in_message')}</div>
	{:else if prices.items.length === 0}
		<div class="alert alert-info mb-4">{$_('product.prices.no_prices_to_edit')}</div>
	{:else}
		<div class="form-control mb-4">
			<label for="price-select">{$_('product.prices.select_price')}</label>
			<select id="price-select" class="input input-bordered w-full" bind:value={selectedPriceId}>
				{#each prices.items as price}
					<option value={price.id}>
						{price.price}
						{price.currency} - {price.date ? new Date(price.date).toLocaleDateString() : 'No date'}
					</option>
				{/each}
			</select>
		</div>

		{#if selectedPriceId}
			<div class="space-y-4">
				<div class="form-control mb-4">
					<label for="price">{$_('product.prices.price')}</label>
					<input
						type="number"
						step="0.01"
						min="0"
						bind:value={editPrice.value}
						name="price"
						id="price"
						class="input input-bordered w-full"
						required
					/>
				</div>

				<div class="form-control mb-4">
					<label for="currency">{$_('product.prices.currency')}</label>
					<input
						type="text"
						bind:value={editPrice.currency}
						name="currency"
						id="currency"
						class="input input-bordered w-full"
						required
					/>
				</div>

				<div class="form-control mb-4">
					<label for="store">{$_('product.prices.store')}</label>
					{#if !nearStores}
						<div>{$_('product.prices.loading_stores')}</div>
					{:else if nearStores.elements.length === 0}
						<div>{$_('product.prices.update_stores')}</div>
					{:else}
						<select
							class="input input-bordered w-full"
							name="store"
							bind:value={editPrice.osm_id}
							required
						>
							{#each nearStores.elements as store}
								<option value={store.id}>{store.tags.name}</option>
							{/each}
						</select>
					{/if}
				</div>

				<div class="form-control mb-4">
					<label for="date">{$_('product.prices.date')}</label>
					<input
						type="date"
						bind:value={editPrice.date}
						name="date"
						id="date"
						class="input input-bordered w-full"
						required
					/>
				</div>

				<button type="button" class="btn btn-primary w-full" onclick={updatePrice}>
					{$_('product.prices.update_price')}
				</button>

				{#if errorMessage}
					<div class="alert alert-error mt-4">{errorMessage}</div>
				{/if}
				{#if successMessage}
					<div class="alert alert-success mt-4">{successMessage}</div>
				{/if}
			</div>
		{/if}
	{/if}
</Card>
