<script lang="ts">
	import Logo from '$lib/ui/Logo.svelte';
	import Footer from '$lib/ui/Footer.svelte';
	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import { t } from '$lib/translations';

	let searchQuery: string = $state('');

	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const GITHUB_REPO_URL = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

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
	$effect(() => {
		updateSearchQuery(page.url);
	});

	function gotoProductsSearch() {
		goto('/products/search?q=' + searchQuery);
	}

	let searchActive = $state(false);
	let accordionOpen = $state(false);
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="bg-base-100 navbar hidden px-10 lg:flex lg:justify-center lg:px-30 xl:px-40">
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
							if (e.key === 'Enter' && searchQuery.trim() !== '') {
								gotoProductsSearch();
							}
						}}
					/>
					<button
						class="btn btn-square btn-secondary join-item px-10"
						onclick={() => gotoProductsSearch()}
						disabled={searchQuery == null || searchQuery.trim() === ''}
					>
						Go
					</button>
				</div>

				<a
					class="btn btn-secondary ms-4 text-lg"
					href="/qr"
					title="Scan a barcode"
					aria-label="Scan a barcode"
				>
					<span class="icon-[mdi--barcode-scan] h-6 w-6"></span>
				</a>
			</div>
		</div>
	</div>

	<div class="navbar-end mx-2 gap-2">
		<a class="btn btn-outline link" href="/folksonomy">{$t('common.folksonomy')}</a>
		<a class="btn btn-outline link" href="/settings">{$t('common.settings')}</a>
		<a
			class="btn btn-outline link"
			href={GITHUB_REPO_URL}
			target="_blank"
			aria-label={$t('common.github')}
		>
			<span class="icon-[mdi--github] h-8 w-8"></span>
		</a>
	</div>
</div>

<div class="bg-base-100 top-0 right-0 left-0 z-50 mx-4 lg:hidden">
	<div class="navbar bg-base-100 mx-auto mt-2 mb-2 max-w-7xl">
		<div class="navbar-start">
			<a href="/">
				<Logo />
			</a>
		</div>
		<div class="navbar-end flex gap-2">
			<button
				aria-label="Search"
				class="btn btn-square btn-secondary text-lg"
				onclick={() => {
					searchActive = !searchActive;
				}}
			>
				<i class="icon-[mdi--magnify]"></i>
			</button>
			<a
				class="btn btn-square btn-secondary text-lg"
				href="/qr"
				title="Scan a barcode"
				aria-label="Scan a barcode"
			>
				<span class="icon-[mdi--barcode-scan] h-6 w-6"></span>
			</a>
			<button
				class="btn btn-square btn-secondary text-lg"
				onclick={() => {
					accordionOpen = !accordionOpen;
				}}
			>
				{#if accordionOpen}
					<i class="icon-[mdi--close]"></i>
				{:else}
					<i class="icon-[mdi--menu]"></i>
				{/if}
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
					if (e.key === 'Enter' && searchQuery.trim() !== '') {
						gotoProductsSearch();
					}
				}}
			/>
			<button
				class="btn btn-square btn-secondary join-item"
				onclick={() => gotoProductsSearch()}
				disabled={searchQuery == null || searchQuery.trim() === ''}
			>
				Go
			</button>
		</div>
	{/if}
	<div class:hidden={!accordionOpen} class="mt-3 flex flex-wrap justify-center gap-2">
		<a class="btn btn-outline link" href="/folksonomy">
			{$t('common.folksonomy')}
		</a>
		<a class="btn btn-outline link" href="/settings">
			{$t('common.settings')}
		</a>
		<a
			class="btn btn-outline link"
			href={GITHUB_REPO_URL}
			target="_blank"
			aria-label={$t('common.github')}
		>
			<span class="icon-[mdi--github] h-6 w-6"></span>
		</a>
	</div>
</div>

<div class="container mx-auto my-2 flex flex-col gap-4 px-4 xl:max-w-6xl">
	{@render children?.()}
</div>

<Footer />
