<script lang="ts">
	import Logo from '$lib/ui/Logo.svelte';
	import '../app.css';
	import 'leaflet/dist/leaflet.css';

	let searchQuery: string;

	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	onMount(() => {
		// only inject the script on the client side
		injectSpeedInsights();
	});

	function updateSearchQuery(url: URL) {
		searchQuery = url.searchParams.get('q') ?? '';
	}
	// update searchQuery when the ?q parameter changes
	$: updateSearchQuery($page.url);

	function gotoProductsSearch() {
		goto('/products/search?q=' + searchQuery);
	}
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="navbar mx-auto mb-8 mt-2 max-w-7xl bg-base-100">
	<div class="navbar-start">
		<a href="/">
			<Logo />
		</a>
	</div>
	<div class="navbar-center">
		<div class="form-control">
			<div>
				<div class="join">
					<input
						type="text"
						bind:value={searchQuery}
						class="input join-item input-bordered w-full"
						placeholder="Query or barcode"
						on:keydown={(e) => {
							if (e.key === 'Enter') {
								gotoProductsSearch();
							}
						}}
					/>
					<button
						class="btn btn-square btn-secondary join-item px-10"
						on:click={() => gotoProductsSearch()}
						disabled={searchQuery == null || searchQuery == ''}
					>
						Go
					</button>
				</div>

				<a class="btn btn-secondary ms-4 px-5 text-lg" href="/qr" title="Scan a barcode">
					<span class="icon-[mdi--camera]"></span>
				</a>
			</div>
		</div>
	</div>

	<div class="navbar-end">
		<a class="btn btn-ghost" href="/folksonomy">Folksonomy</a>
		<a class="btn btn-ghost" href="/settings">Settings</a>
	</div>
</div>

<div class="container mx-auto my-2 flex flex-col gap-4 xl:max-w-6xl">
	<slot />
</div>
