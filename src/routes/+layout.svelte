<script lang="ts">
	import Logo from '$lib/ui/Logo.svelte';
	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import { t } from '$lib/translations';

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

	let searchActive = false;
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="navbar hidden md:flex">
	<div class="navbar-start">
		<a href="/"> <Logo /> </a>
	</div>
	<div class="navbar-center">
		<div class="form-control">
			<div>
				<div class="join">
					<input
						type="text"
						bind:value={searchQuery}
						class="input join-item input-bordered xl:w-full"
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

	<div class="navbar-end gap-2">
		<a class="btn btn-outline link" href="/folksonomy">{$t('common.folksonomy')}</a>
		<a class="btn btn-outline link" href="/settings">{$t('common.settings')}</a>
	</div>
</div>

<div class="mx-4 md:hidden">
	<div class="navbar mx-auto mb-8 mt-2 max-w-7xl bg-base-100">
		<div class="navbar-start">
			<a href="/">
				<Logo />
			</a>
		</div>
		<div class="navbar-end">
			<button
				class="btn btn-square btn-secondary text-lg"
				on:click={() => {
					searchActive = !searchActive;
				}}
			>
				<i class="icon-[mdi--magnify]"></i>
			</button>
		</div>
	</div>
	{#if searchActive}
		<div class="join -mt-8 w-full">
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
				class="btn btn-square btn-secondary join-item"
				on:click={() => gotoProductsSearch()}
				disabled={searchQuery == null || searchQuery == ''}
			>
				Go
			</button>
		</div>
	{/if}
</div>

<div class="container mx-auto my-2 flex flex-col gap-4 px-4 xl:max-w-6xl">
	<slot />
</div>
