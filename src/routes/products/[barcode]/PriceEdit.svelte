<script lang="ts">
	import { preventDefault } from 'svelte/legacy';
	import { PricesApi, type Prices } from '$lib/api/prices';
	import { onMount } from 'svelte';
	import { getNearStores, type OverpassAPIResult } from '$lib/location';
	import { invalidateAll } from '$app/navigation';
	import Card from '$lib/ui/Card.svelte';
	import { t } from '$lib/translations';

	interface Props {
		prices: Prices;
		barcode: string;
	}

	let { prices, barcode }: Props = $props();

	let pricesApi: PricesApi;
	let authenticated: boolean = $state(false);
	let nearStores: OverpassAPIResult | undefined = $state();
	let errorMessage: string | null = $state(null);
	let successMessage: string | null = $state(null);
	let selectedPriceId: string | null = $state(null);

	let editPrice = $state({
		value: 0,
		currency: '',
		osm_id: 0,
		date: ''
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

	function selectPrice(id: string) {
		const price = prices.items.find((p) => p.id === id);
		if (!price) return;

		editPrice = {
			value: price.price,
			currency: price.currency,
			osm_id: price.location_osm_id,
			date: price.date
		};
		errorMessage = null;
		successMessage = null;
	}

	async function updatePrice() {
		if (!selectedPriceId || !authenticated) return;

		const type = nearStores?.elements.find((el) => el.id === editPrice.osm_id)?.type?.toUpperCase();
		if (!type) {
			errorMessage = "Couldn't find store type";
			return;
		}

		const res = await pricesApi.updatePrice(parseInt(selectedPriceId), {
			product_code: barcode,
			price: editPrice.value,
			currency: editPrice.currency,
			date: editPrice.date,
			location_osm_id: editPrice.osm_id,
			location_osm_type: type as 'NODE' | 'WAY' | 'RELATION'
		});

		if (res.error != null) {
			errorMessage = 'Error while updating price: ' + res.error.message;
			console.error('Error while updating price', res.error);
		} else {
			successMessage = 'Price updated successfully';
			console.debug('Updated price', res.data);
			const index = prices.items.findIndex((p) => p.id === selectedPriceId);
			if (index !== -1) {
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
	<h3 class="mb-4 text-3xl font-bold">Edit Price</h3>

	{#if !authenticated}
		<div class="alert alert-warning mb-4">{$t('home.log_in_message')}</div>
	{:else if prices.items.length === 0}
		<div class="alert alert-info mb-4">{$t('home.no_prices_to_edit')}</div>
	{:else}
		<div class="form-control mb-4">
			<label for="price-select">Select a Price to Edit</label>
			<select id="price-select" class="input input-bordered w-full" bind:value={selectedPriceId}>
				{#each prices.items as price}
					<option value={price.id}>
						{price.price}
						{price.currency} - {new Date(price.date).toLocaleDateString()}
					</option>
				{/each}
			</select>
		</div>

		{#if selectedPriceId}
			<div class="space-y-4">
				<div class="form-control mb-4">
					<label for="price">Price</label>
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
					<label for="currency">Currency</label>
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
					<label for="store">Store</label>
					{#if !nearStores}
						<div>Loading stores...</div>
					{:else if nearStores.elements.length === 0}
						<div>No stores found</div>
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
					<label for="date">Date</label>
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
					Update Price
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
