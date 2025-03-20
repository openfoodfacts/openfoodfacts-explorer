<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { PricesApi, type Prices } from '$lib/api/prices';
	import { onMount } from 'svelte';

	import { getNearStores, idToName, type OverpassAPIResult } from '$lib/location';
	import { invalidateAll } from '$app/navigation';
	import type { components } from '$lib/api/prices.d';

	type ApiResponse<T> = { data?: T; error?: any };

	interface Props {
		prices: {
			count: number;
			next?: string | null;
			previous?: string | null;
			results: any[];
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
		currency: components['schemas']['CurrencyEnum'];
		osm_id: number;
	};

	let newPrice: NewPriceForm = $state({
		value: 0,
		currency: 'EUR' as components['schemas']['CurrencyEnum'],
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

		const res = (await pricesApi.createPrice({
			product_code: barcode,
			price: newPrice.value,
			currency: newPrice.currency as components['schemas']['CurrencyEnum'],
			// we only need the date, not the time
			date: today.toISOString().split('T')[0],

			// TODO: Add location
			location_osm_id: newPrice.osm_id,
			location_osm_type: type as 'NODE' | 'WAY' | 'RELATION',

			// Required property
			proof_id: 0 // This should be replaced with an actual proof ID if available
		})) as ApiResponse<any>;

		if (res.error != null) {
			console.error('Error while submitting price', res.error);
		} else {
			console.debug('Submitted price', res.data);
			prices.results.push(res.data);
			invalidateAll();
		}
	}
</script>

<div>
	<div id="prices">
		<span class="font-bold">
			Prices: ({prices.count ?? 0}/{prices.count ?? 0})
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
				{#each prices.results as price}
					<tr>
						<td>{price.price + ' ' + price.currency}</td>
						<td>
							{#await idToName(fetch, price.location_osm_id)}
								Loading...
							{:then storeName}
								<a
									href={`https://www.openstreetmap.org/${price.location_osm_type.toLowerCase()}/${
										price.location_osm_id
									}`}
								>
									{storeName}
								</a>
							{:catch error}
								<span class="text-red-500">Error: {error.message}</span>
							{/await}
						</td>
						<td>{new Date(price.date).toLocaleDateString()}</td>
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
						{#each nearStores?.elements as store}
							<option value={store.id}>{store.tags.name}</option>
						{/each}
					</select>
				{/if}

				<div></div>
				<button class="btn" type="submit">Submit</button>
			</form>
		{:else}
			<h2 class="mb-4 text-2xl font-bold">Login</h2>
			<form class="space-y-4" onsubmit={preventDefault(login)}>
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
