<script lang="ts">
	import { onMount } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import { Matomo } from '@sinnwerkstatt/sveltekit-matomo';

	import '../app.css';
	import 'leaflet/dist/leaflet.css';
	import '@fontsource-variable/plus-jakarta-sans';

	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import Logo from '$lib/ui/Logo.svelte';
	import Navbar from '$lib/ui/Navbar.svelte';
	import Footer from '$lib/ui/Footer.svelte';
	import NutritionCalculator from '$lib/ui/NutritionCalculator.svelte';
	import SearchBar from '$lib/ui/SearchBar.svelte';

	import { initI18n, _, isLoading } from '$lib/i18n';
	import { KEYCLOAK_ACCOUNT_URL, MATOMO_HOST, MATOMO_SITE_ID, NO_MARGIN_ROUTES } from '$lib/const';
	import { userInfo } from '$lib/stores/pkceLoginStore';
	import { extractQuery } from '$lib/facets';
	import { dev } from '$app/environment';

	onMount(async () => {
		await import('@openfoodfacts/openfoodfacts-webcomponents');
	});

	// Initialize i18n
	initI18n();

	let searchQuery: string = $state('');

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		// only inject the script on the client side
		injectSpeedInsights();
	});

	function updateSearchQuery(url: URL) {
		const q = url.searchParams.get('q') ?? '';
		searchQuery = extractQuery(q);
	}
	// update searchQuery when the ?q parameter changes
	$effect(() => {
		updateSearchQuery(page.url);
	});

	let isSearching = $state(false);

	async function gotoProductsSearch() {
		isSearching = true;
		await goto('/products/search?q=' + searchQuery);
		isSearching = false;
	}

	let searchActive = $state(false);
	let accordionOpen = $state(false);
</script>

<svelte:head>
	<title>OFF Explorer</title>
	<meta name="description" content="Open Food Facts Explorer" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<Matomo url={MATOMO_HOST} siteId={MATOMO_SITE_ID} />

{#if !$isLoading}
	<!-- Global OpenFoodFacts Web Components Configuration -->
	<off-webcomponents-configuration
		language-code="en"
		assets-images-path="/assets/webcomponents"
		robotoff-configuration={{
			dryRun: !dev,
			apiUrl: 'https://robotoff.openfoodfacts.net/api/v1',
			imgUrl: 'https://images.openfoodfacts.net/images/products'
		}}
	>
	</off-webcomponents-configuration>

	<div class="flex justify-center">
		<div class="bg-base-100 navbar hidden max-w-7xl px-10 xl:flex">
			<div class="navbar-start">
				<a href="/"> <Logo /> </a>
			</div>
			<div class="navbar-center">
				<SearchBar bind:searchQuery onSearch={gotoProductsSearch} loading={isSearching} />
			</div>
			<div class="navbar-end gap-2">
				<NutritionCalculator />
				{#if $userInfo != null}
					<a class="btn btn-outline link" href={KEYCLOAK_ACCOUNT_URL}>Account</a>
					<a class="btn btn-outline link" href="/logout">Log out</a>
				{:else}
					<a class="btn btn-outline link" href="/login"> Login </a>
				{/if}
				<a
					class="btn btn-ghost link"
					href="/settings"
					aria-label={$_('settings_link')}
					title={$_('settings_link')}
				>
					<span class="icon-[mdi--cog] text-2xl"></span>
				</a>
			</div>
		</div>
	</div>

	<!-- Only show Navbar on lg and up -->
	<div class="hidden xl:block">
		<Navbar />
	</div>

	<div class="bg-base-100 top-0 right-0 left-0 z-50 mx-4 xl:hidden">
		<div class="navbar bg-base-100 mx-auto mt-2 mb-2 px-0">
			<div class="navbar-start">
				<a href="/">
					<Logo />
				</a>
			</div>
			<div class="navbar-end flex gap-1 sm:gap-2">
				<button
					aria-label={$_('search.button')}
					class="btn btn-square btn-secondary text-lg"
					onclick={() => {
						searchActive = !searchActive;
					}}
				>
					<i class="icon-[mdi--magnify]"></i>
				</button>
				<button
					title={$_('menu.button')}
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
			<div class="flex justify-center">
				<SearchBar bind:searchQuery onSearch={gotoProductsSearch} loading={isSearching} />
			</div>
		{/if}
		<div
			class:hidden={!accordionOpen}
			class="mt-3 flex flex-col gap-2 md:flex-row md:flex-wrap md:justify-center"
		>
			<a class="btn btn-outline link" href="/static/discover">
				{$_('discover_link')}
			</a>
			<a class="btn btn-outline link" href="/static/contribute">
				{$_('contribute_link')}
			</a>
			<a class="btn btn-outline link" href="/static/producers">
				{$_('producers_link')}
			</a>
			<a class="btn btn-outline link" href="https://prices.openfoodfacts.org">
				{$_('prices_link')}
			</a>
			<a class="btn btn-outline link" href="/folksonomy">
				{$_('folksonomy_link')}
			</a>
			<a class="btn btn-outline link" href="/facets">
				{$_('facets_link')}
			</a>

			<div class="divider md:divider-horizontal"></div>
			<a
				class="btn btn-outline link"
				href="/settings"
				title={$_('settings_link')}
				aria-label={$_('settings_link')}
			>
				{$_('settings_link')}
			</a>

			{#if $userInfo != null}
				<a class="btn btn-outline link" href={KEYCLOAK_ACCOUNT_URL}>Account</a>
				<a class="btn btn-outline link" href="/logout">Log out</a>
			{:else}
				<a class="btn btn-outline link" href="/login"> Login </a>
			{/if}
		</div>
	</div>

	{#if NO_MARGIN_ROUTES.includes(page.url.pathname)}
		<div class="w-full">
			{@render children?.()}
		</div>
	{:else}
		<div class="container mx-auto my-2 gap-4 px-4 xl:max-w-6xl">
			{@render children?.()}
		</div>
	{/if}
	<NutritionCalculator />
	<Footer />
{:else}
	<div class="py-10 text-center text-xl font-medium">Loading translations...</div>
{/if}
