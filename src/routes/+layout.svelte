<script lang="ts">
	import { run } from 'svelte/legacy';

	import Logo from '$lib/ui/Logo.svelte';
	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import { t } from '$lib/translations';

	let searchQuery: string = $state();

	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		// only inject the script on the client side
		injectSpeedInsights();
	});

	function updateSearchQuery(url: URL) {
		searchQuery = url.searchParams.get('q') ?? '';
	}
	// update searchQuery when the ?q parameter changes
	run(() => {
		updateSearchQuery($page.url);
	});

	function gotoProductsSearch() {
		goto('/products/search?q=' + searchQuery);
	}

	let searchActive = $state(false);
	let sidebarActive = $state(false);
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
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								gotoProductsSearch();
							}
						}}
					/>
					<button
						class="btn btn-square btn-secondary join-item px-10"
						onclick={() => gotoProductsSearch()}
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
		<div class="navbar-end flex gap-2">
			<button
				class="btn btn-square btn-secondary text-lg"
				onclick={() => {
					searchActive = !searchActive;
				}}
			>
				<i class="icon-[mdi--magnify]"></i>
			</button>
			<button
				class="btn btn-square btn-secondary text-lg"
				onclick={() => {
					sidebarActive = !sidebarActive;
				}}
			>
				<i class="icon-[mdi--menu]"></i>
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
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						gotoProductsSearch();
					}
				}}
			/>
			<button
				class="btn btn-square btn-secondary join-item"
				onclick={() => gotoProductsSearch()}
				disabled={searchQuery == null || searchQuery == ''}
			>
				Go
			</button>
		</div>
	{/if}

	{#if sidebarActive}
		<div class="fixed inset-y-0 bg-[#201a17] left-0 w-64 z-20 shadow-lg p-4 transition-transform duration-300">
			<button class="btn btn-sm btn-error mb-4" onclick={() => (sidebarActive = false)}>
				Close
			</button>
			<div class="flex flex-col gap-2 navbar-end w-full">
				<a onclick={() => (sidebarActive = false)} class="btn btn-outline link" href="/">Home</a>
				<a onclick={() => (sidebarActive = false)} class="btn btn-outline link" href="/folksonomy">{$t('common.folksonomy')}</a>
				<a onclick={() => (sidebarActive = false)} class="btn btn-outline link" href="/settings">{$t('common.settings')}</a>
			</div>
		</div>
	{/if}
</div>


<div class="container mx-auto my-2 flex flex-col gap-4 px-4 xl:max-w-6xl">
	{@render children?.()}
</div>
