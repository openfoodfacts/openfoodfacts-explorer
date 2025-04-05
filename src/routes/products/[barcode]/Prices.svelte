<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { PricesApi } from '$lib/api/prices';
	import { onMount } from 'svelte';

	import { getNearStores, idToName, type OverpassAPIResult } from '$lib/location';
	import { invalidateAll } from '$app/navigation';
	import type { components } from '$lib/api/prices.d';

	type CurrencyEnum = components['schemas']['CurrencyEnum'];
	type ApiResponse<T> = { data?: T; error?: object };

	type PriceResult = {
		readonly id: number;
		product_id: number;
		location_id: number;
		proof_id: number;
		product: {
			readonly id: number;
			code: string;
		};
		location: unknown;
		proof: unknown;
		type: string;
		product_code?: string | null;
		product_name?: string | null;
		category_tag?: string | null;
		labels_tags?: unknown;
		origins_tags?: unknown;
		price?: number | null;
		price_is_discounted?: boolean;
		price_without_discount?: number | null;
		discount_type?: unknown | null;
		price_per?: unknown | null;
		currency?: string | null;
		location_osm_id?: number | null;
		location_osm_type?: 'NODE' | 'WAY' | 'RELATION' | '' | null;
		date?: string | null;
		receipt_quantity?: number | null;
		owner?: string | null;
		source?: string | null;
		created?: string;
		readonly updated: string;
	};

	interface Props {
		prices: {
			count: number;
			next?: string | null;
			previous?: string | null;
			results: PriceResult[];
		};
		barcode: string;
	}

	let { prices, barcode }: Props = $props();

	let pricesApi: PricesApi;
	let authenticated: boolean = $state(false);
	let authStatus: undefined | boolean = $state();

	let nearStores: OverpassAPIResult | undefined = $state();

	onMount(async () => {
		pricesApi = new PricesApi(fetch);
		authenticated = await pricesApi.isAuthenticated();

		nearStores = await getNearStores();
	});

	type NewPriceForm = {
		value: number;
		currency: CurrencyEnum;
		osm_id: number;
	};

	let newPrice: NewPriceForm = $state({
		value: 0,
		currency: 'EUR' as CurrencyEnum,
		osm_id: 0
	});

	let loginFields = $state({ email: '', password: '' });

	async function login() {
		console.debug('Logging in...');
		const res = (await pricesApi.login({
			username: loginFields.email,
			password: loginFields.password
		})) as ApiResponse<components['schemas']['SessionResponse']>;

		if (res.error != null) {
			console.error('Error while logging in', res.error);
			authStatus = false;

			setTimeout(() => {
				authStatus = undefined;
			}, 2000);
		} else {
			console.debug('Logged in', res.data);
			authStatus = true;
			setTimeout(() => {
				authenticated = true;
			}, 1000);
		}
	}

	async function submitPrice() {
		const today = new Date();

		const type = nearStores?.elements.find((el) => el.id === newPrice.osm_id)?.type?.toUpperCase();
		if (type == null) {
			throw new Error("Illegal state: Couldn't find store type");
		}

		const res = await pricesApi.createPrice({
			product_code: barcode,
			price: newPrice.value,
			currency: newPrice.currency,
			// we only need the date, not the time
			date: today.toISOString().split('T')[0],

			// TODO: Add location
			location_osm_id: newPrice.osm_id,
			location_osm_type: type as 'NODE' | 'WAY' | 'RELATION',

			// Required property
			proof_id: 0 // This should be replaced with an actual proof ID if available
		});

		if (res.error != null) {
			// @ts-expect-error - TODO: Types should be specified in a better way
			console.error('Error while submitting price', res.error);
		} else {
			console.debug('Submitted price', res.data);
			// @ts-expect-error - TODO: Types should be specified in a better way
			prices.results.push(res.data);
			invalidateAll();
		}
	}
</script>

<div>
	<div id="prices">
		<span class="font-bold">
			Prices: ({Math.min(prices?.results?.length ?? 0, prices?.count ?? 0)}/{prices?.count ?? 0})
		</span>
		<table class="table-zebra table">
			<thead>
				<tr>
					<th>Price</th>
					<th>Store</th>
					<th>Date</th>
				</tr>
			</thead>
			<tbody>
				{#each prices.results as price (price.id)}
					<tr>
						<td
							>{price.price != null ? price.price + ' ' + (price.currency ?? 'Unknown') : 'N/A'}</td
						>
						<td>
							{#if price.location_osm_id != null}
								{#await idToName(fetch, price.location_osm_id)}
									Loading...
								{:then storeName}
									<a
										href={`https://www.openstreetmap.org/${(price.location_osm_type ?? 'node').toLowerCase()}/${
											price.location_osm_id
										}`}
									>
										{storeName}
									</a>
								{:catch error}
									<span class="text-red-500">Error: {error.message}</span>
								{/await}
							{:else}
								Unknown location
							{/if}
						</td>
						<td>{price.date ? new Date(price.date).toLocaleDateString() : 'Unknown date'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="my-4" id="new-price">
		{#if authenticated == null}
			<progress class="progress progress-primary"></progress>
		{:else if authenticated}
			<h3 class="text-2xl font-bold">Report a new price</h3>
			<form
				class="my-2 grid grid-flow-col grid-rows-2 gap-x-3"
				onsubmit={preventDefault(submitPrice)}
			>
				<label for="price" class="label">
					<span class="label-text">Price</span>
				</label>
				<input
					type="number"
					bind:value={newPrice.value}
					name="price"
					id="price"
					class="input input-bordered"
				/>

				<label for="currency" class="label">
					<span class="label-text">Currency</span>
				</label>
				<input
					class="input input-bordered"
					bind:value={newPrice.currency}
					type="text"
					name="currency"
					id="currency"
				/>

				<label for="store" class="label">
					<span class="label-text">Store</span>
				</label>

				{#if nearStores == null}
					<div>Loading...</div>
				{:else if nearStores.elements.length === 0}
					<div>No stores found</div>
				{:else}
					<select class="select select-bordered" name="store" bind:value={newPrice.osm_id}>
						{#each nearStores?.elements as store (store.id)}
							<option value={store.id}>{store.tags.name}</option>
						{/each}
					</select>
				{/if}

				<div></div>
				<button class="btn" type="submit">Submit</button>
			</form>
		{:else}
			<h2 class="mb-4 text-2xl font-bold">Login</h2>
			<form
				class="space-y-4"
				onsubmit={(e) => {
					e.preventDefault();
					login();
				}}
			>
				<div>
					<label for="email" class="block font-medium">Email</label>
					<input type="text" bind:value={loginFields.email} class="input input-bordered w-full" />
				</div>
				<div>
					<label for="password" class="block font-medium">Password</label>
					<input
						type="password"
						bind:value={loginFields.password}
						class="input input-bordered w-full"
					/>
				</div>
				<div>
					<button type="submit" class="btn btn-primary w-full">Login</button>
				</div>
			</form>

			{#if authStatus}
				<div class="alert alert-success mt-4">Logged in!</div>
			{:else if authStatus === false}
				<div class="alert alert-error mt-4">Error while logging in</div>
			{/if}
		{/if}
	</div>
</div>
